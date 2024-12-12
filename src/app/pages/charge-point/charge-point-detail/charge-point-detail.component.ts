import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { RoleType } from '../../../@core/models/user';
import { TagResponse } from '../../../@core/models/common';
import {
  ChargePointStatus,
  RoamingPointDto,
  RoamingPointsService,
  RoamingSessionStatus,
  RoamingTransactionsService
} from '../../../../../api';
import { ChargingLevel } from '../../../../../api/model/chargingLevel';
import { ChargingPowerType } from '../../../../../api/model/chargingPowerType';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuItem } from 'primeng/api';
import * as atlas from 'azure-maps-control';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { SessionListComponent } from '../../session/session-list/session-list.component';
import { TransactionListComponent } from '../../transaction/transaction-list/transaction-list.component';
import { SurgeAvatarComponent } from 'surge-components';
import { ClipboardModule } from 'ngx-clipboard';
import { timer } from 'rxjs';

@Component({
  selector: 'app-charge-point-detail',
  templateUrl: './charge-point-detail.component.html',
  styleUrls: ['./charge-point-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    MenuModule,
    LoaderComponent,
    HeaderPanelComponent,
    SessionListComponent,
    TransactionListComponent,
    SurgeAvatarComponent,
    ClipboardModule,
    NgIf,
    NgFor,
    AsyncPipe
  ]
})
export class ChargePointDetailComponent extends ScrollableComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('sectionContainer') sectionContainers!: QueryList<ElementRef>;

  infoPanelTitle = this.getTranslate('PAGES.CHARGE-POINTS.NOT-PAIRED-TITLE');
  infoPanelDescription = this.getTranslate(
    'PAGES.CHARGE-POINTS.NOT-PAIRED-DESCRIPTION'
  );

  plusIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'regular')
  );
  chargePointIconMedium: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );
  homeSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.HomeSvg.name, '')
  );
  arrowDownIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ArrowDownIcon.name, '')
  );

  noChargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'xxlarge none',
      true
    )
  );

  noChargePointIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'gigantic none',
      true
    )
  );

  chargePointId: string;
  chargePointResponse: RoamingPointDto;
  roleTypes = RoleType;

  tagsResponse: any[] = [];
  chargePointTagsResponse: TagResponse[];
  infoDescription: string[] = [];

  chargingLevel = ChargingLevel;
  chargingPowerType = ChargingPowerType;
  chargePointLoading: boolean;

  actionMenuItems: MenuItem[];

  statusTypes = RoamingSessionStatus;

  secureConnectUrl: string;
  nonSecureConnectUrl: string;

  secureVisible = false;
  nonSecureVisible = false;

  constructor(
    protected transactionsService: RoamingTransactionsService,
    protected chargePointsService: RoamingPointsService,
    protected sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        this.chargePointId = params['id'];
        this.getChargePoint();
      })
    );

    this.generateTabs();
  }

  generateTabs() {
    this.tabs = [];

    this.tabs = [
      {
        label: this.getTranslate('COMMON.OVERVIEW'),
        content: null,
        routeTab: ''
      }
    ];

    this.tabs.push({
      label: this.getTranslate('PAGES.TRANSACTIONS.TITLE'),
      content: null,
      routeTab: 'transactions'
    });

    this.tabs.push({
      label: this.getTranslate('PAGES.SESSIONS.TITLE'),
      content: null,
      routeTab: 'sessions'
    });

    this.sharedService.changeSelectedTab(0);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        const tabName = params['tabName'];
        const tabIndex = this.tabs.findIndex(tab => tab?.routeTab === tabName);

        if (tabIndex !== -1) {
          this.sharedService.selectedTabIndex.next(tabIndex);
        }
      })
    );
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
    super.ngAfterViewInit();
  }

  initializeMap() {
    setTimeout(() => this.initMap(), 0);
  }

  initMap(): void {
    this.map = new atlas.Map('Map', {
      ...this.mapOptions
    });

    this.map.events.add('ready', () => {
      this.dataSource = new atlas.source.DataSource();

      this.map!.sources.add(this.dataSource);

      const controls = [
        new atlas.control.ZoomControl(),
        new atlas.control.CompassControl(),
        new atlas.control.StyleControl(),
        new atlas.control.PitchControl(),
        new atlas.control.TrafficControl()
      ];

      this.map.controls.add(controls, {
        position: atlas?.ControlPosition?.TopRight
      });

      this.setupMapEvents(this.mapOptions?.center);
    });
  }

  setupMapEvents(coords: atlas.data.Position): void {
    if (this.map && this.dataSource) {
      const symbolLayer = new atlas.layer.SymbolLayer(this.dataSource, '');
      this.map.layers.add(symbolLayer);

      if (coords) {
        this.addPointToMap(coords);
      }
    }
  }

  addPointToMap(coords: atlas.data.Position): void {
    if (this.point) {
      this.dataSource.remove([this.point]);
    }

    this.map.imageSprite
      .add('available', '.../../../../assets/svg/available.svg')
      .then(() => {
        this.point = new atlas.Shape(
          new atlas.data.Feature(new atlas.data.Point(coords), {
            icon: 'available'
          })
        );
        this.dataSource.add([this.point]);
      });

    const symbolLayer = new atlas.layer.SymbolLayer(this.dataSource, null, {
      iconOptions: {
        image: ['get', 'icon'],
        allowOverlap: true
      }
    });

    this.map.layers.add(symbolLayer);

    this.map.setCamera({
      center: [coords[0], coords[1]],
      duration: 1000,
      type: 'fly'
    });
  }

  getChargePoint() {
    this.chargePointLoading = true;
    this.subscription.add(
      this.chargePointsService
        .roamingPointsIdGet(this.chargePointId)
        .subscribe({
          next: v => {
            this.chargePointResponse = v;

            if (this.sharedService.selectedTabIndex.value === 0) {
              let chargePointTagColor;
              switch (this.chargePointResponse?.status) {
                case ChargePointStatus.Unavailable:
                  chargePointTagColor = 'gray';
                  break;
                case ChargePointStatus.Available:
                  chargePointTagColor = 'green';
                  break;
                case ChargePointStatus.Faulted:
                  chargePointTagColor = 'red';
                  break;
              }

              this.chargePointTagsResponse = [
                {
                  icon: null,
                  text: this.getEnumTypeTranslation(
                    ChargePointStatus,
                    this.chargePointResponse?.status
                  ),
                  color: chargePointTagColor
                },
                {
                  icon: null,
                  text: this.chargePointResponse?.isActive
                    ? this.getTranslate('COMMON.ACTIVE')
                    : this.getTranslate('COMMON.PASSIVE')
                }
              ];

              if (
                this.chargePointResponse?.longitude &&
                this.chargePointResponse?.latitude
              ) {
                let position: atlas.data.Position;
                position = new atlas.data.Position(
                  Number(this.chargePointResponse?.longitude),
                  Number(this.chargePointResponse?.latitude)
                );
                this.mapOptions.center = position;
                this.chargePointLoading = false;
                this.initializeMap();
              }
            } else {
              this.chargePointLoading = false;
            }

            this.getConnectUrl();

            // TODO:
            this.breadcrumbMenuItems = [
              { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
              // {
              //   label: this.getDecodedUserToken()?.extension_Directory?.name,
              //   routerLink: '/dashboard',
              // },
              {
                label: this.getTranslate('PAGES.CHARGE-POINTS.TITLE'),
                routerLink: '/charge-points'
              },
              { label: this.chargePointResponse?.name }
            ];
            this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.chargePointLoading = false;
          },
          complete: () => {}
        })
    );
  }

  getConnectUrl() {
    let webSocketUrl = this.chargePointResponse?.url;

    if (webSocketUrl.startsWith('wss://')) {
      this.secureConnectUrl = webSocketUrl;
      this.nonSecureConnectUrl = webSocketUrl.replace('wss://', 'ws://');
    } else if (webSocketUrl.startsWith('ws://')) {
      this.nonSecureConnectUrl = webSocketUrl;
      this.secureConnectUrl = webSocketUrl.replace('ws://', 'wss://');
    }
  }

  copyUrl(urlType: string) {
    if (urlType === 'secure') {
      this.secureVisible = true;
      this.subscription.add(
        timer(1500).subscribe(() => {
          this.secureVisible = false;
        })
      );
    } else {
      this.nonSecureVisible = true;
      this.subscription.add(
        timer(1500).subscribe(() => {
          this.nonSecureVisible = false;
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.map) {
      this.map.dispose();
    }
  }
}
