import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
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
import { ChargePointsService } from '../../../../../api/api/chargePoints.service';
import { ChargePointDto } from '../../../../../api/model/chargePointDto';
import { ChargePointSourceType } from '../../../../../api/model/chargePointSourceType';
import { TagResponse } from '../../../@core/models/common';
import {
  ReportsService,
  ConnectChargePointCommand,
  ResetCommand,
  CurrencyDto,
  TransactionsService
} from '../../../../../api';
import { ChargePointAccessibility } from '../../../../../api/model/chargePointAccessibility';
import { ChargePointProtocol } from '../../../../../api/model/chargePointProtocol';
import { ChargePointStatus } from '../../../../../api/model/chargePointStatus';
import { ChargeSessionStatus } from '../../../../../api/model/chargeSessionStatus';
import { ChargingLevel } from '../../../../../api/model/chargingLevel';
import { ChargingMode } from '../../../../../api/model/chargingMode';
import { ChargingPowerType } from '../../../../../api/model/chargingPowerType';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { MenuItem } from 'primeng/api';
import { Policy } from '../../../@core/models/policy';
import * as atlas from 'azure-maps-control';
import { timer } from 'rxjs';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { OverviewStatisticComponent } from '../../../@core/components/statistics/overview-statistic/overview-statistic.component';
import { SurgeAvatarComponent } from 'surge-components';
import { ClipboardModule } from 'ngx-clipboard';
import { MenuModule } from 'primeng/menu';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { SessionListComponent } from '../../session/session-list/session-list.component';
import { TransactionListComponent } from '../../transaction/transaction-list/transaction-list.component';
import { ChargePointConnectorComponent } from '../charge-point-connector/charge-point-connector.component';

@Component({
  selector: 'app-charge-point-detail',
  templateUrl: './charge-point-detail.component.html',
  styleUrls: ['./charge-point-detail.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    HeaderPanelComponent,
    InfoPanelComponent,
    LoaderComponent,
    OverviewStatisticComponent,
    SurgeAvatarComponent,
    ClipboardModule,
    MenuModule,
    NgIf,
    NgFor,
    AsyncPipe,
    TransactionListComponent,
    SessionListComponent,
    ChargePointConnectorComponent
  ]
})
export class ChargePointDetailComponent extends ScrollableComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('sectionContainer') sectionContainers!: QueryList<ElementRef>;

  @ViewChild('actionMenu') actionMenu: any;

  infoPanelTitle = this.getTranslate('PAGES.CHARGE-POINTS.NOT-PAIRED-TITLE');
  infoPanelDescription = this.getTranslate(
    'PAGES.CHARGE-POINTS.NOT-PAIRED-DESCRIPTION'
  );

  totalSessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.TotalSessionIcon.name, '', true)
  );

  settingIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular')
  );
  settingIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular black')
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

  directoryId: string;
  chargePointId: string;
  chargePointResponse: ChargePointDto;
  chargePointSourceType = ChargePointSourceType;
  roleTypes = RoleType;
  secureConnectUrl: string;
  nonSecureConnectUrl: string;

  secureVisible = false;
  nonSecureVisible = false;

  tagsResponse: any[] = [];
  chargePointTagsResponse: TagResponse[];
  infoDescription: string[] = [];

  chargingLevel = ChargingLevel;
  chargingPowerType = ChargingPowerType;
  chargePointProtocol = ChargePointProtocol;
  chargingMode = ChargingMode;

  chargePointLoading: boolean;

  actionMenuItems: MenuItem[];
  currenciesData: any[];

  statusTypes = ChargeSessionStatus;

  constructor(
    protected transactionsService: TransactionsService,
    protected chargePointsService: ChargePointsService,
    protected reportService: ReportsService,
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
    this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
      ? this.getDecodedUserToken()?.extension_DirectoryId
      : null;

    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        this.chargePointId = params['id'];
        this.getChargePoint();
      })
    );

    this.generateTabs();

    this.components = {
      confirmationDialog: ConfirmationDialogComponent
    };
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

    if (this.isUserValidForPolicies([Policy.ChargePointRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.CONNECTORS.CONNECTORS'),
        content: null,
        routeTab: 'connectors'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

    if (this.isUserValidForPolicies([Policy.TransactionRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.TRANSACTIONS.TITLE'),
        content: null,
        routeTab: 'transactions'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

    if (this.isUserValidForPolicies([Policy.ChargeSessionRead])) {
      this.tabs.push({
        label: this.getTranslate('PAGES.SESSIONS.TITLE'),
        content: null,
        routeTab: 'sessions'
      });
    } else {
      this.tabs.push({
        label: null,
        content: null,
        routeTab: null
      });
    }

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

  generateActionMenuItems(): any {
    this.actionMenu.toggle(event);

    this.actionMenuItems = [];

    if (this.isUserValidForPolicies([Policy.ChargePointReset])) {
      this.actionMenuItems.push({
        label: this.getTranslate('PAGES.CHARGE-POINTS.ACTIONS.REBOOT'),
        command: () => this.resetChargePointConfirmation()
      });
    }

    return this.actionMenuItems;
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

  generateCurrenciesData(currencies: CurrencyDto[]): any {
    this.currenciesData = [];
    return currencies.forEach(currency => {
      this.currenciesData.push({
        label: currency?.code,
        value: currency
      });
    });
  }

  getChargePoint() {
    this.chargePointLoading = true;
    this.subscription.add(
      this.chargePointsService
        .chargePointsIdGet(this.chargePointId, null)
        .subscribe({
          next: v => {
            this.chargePointResponse = v;

            if (
              this.sharedService.selectedTabIndex.value === 0 &&
              this.chargePointResponse?.isPaired
            ) {
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
                },
                {
                  icon: null,
                  text: this.getEnumTypeTranslation(
                    ChargePointAccessibility,
                    this.chargePointResponse?.chargePointAccessibility
                  )
                }
              ];

              this.loadData();

              if (
                this.isUserValidForPolicies([
                  Policy.AdminRead,
                  Policy.DirectoryUpdate
                ])
              ) {
                this.getConnectUrl();
              }

              if (
                this.chargePointResponse?.isPaired &&
                this.chargePointResponse?.address?.longitude &&
                this.chargePointResponse?.address?.latitude
              ) {
                let position: atlas.data.Position;
                position = new atlas.data.Position(
                  Number(this.chargePointResponse?.address?.longitude),
                  Number(this.chargePointResponse?.address?.latitude)
                );
                this.mapOptions.center = position;
                this.chargePointLoading = false;
                this.initializeMap();
              }
            } else {
              this.chargePointLoading = false;
            }

            this.breadcrumbMenuItems = [
              { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
              {
                label: this.getDecodedUserToken()?.extension_Directory?.name,
                routerLink: '/dashboard'
              },
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

  loadData() {
    let currencies = this.sharedService.getCurrencies();
    this.generateCurrenciesData(currencies);
  }

  onActivate(data): void {
    // console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  resetChargePointConfirmation() {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.RESET-CHARGE-POINT'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.RESET-CHARGE-POINT-DESCRIPTION',
        { name: this.chargePointResponse?.name }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.RESET-CHARGE-POINT'),
      confirmEventCallback: (eventData: any) => {
        this.resetChargePoint();
      }
    };

    this.open(this.components.confirmationDialog);
  }

  resetChargePoint() {
    this.buttonLoading = true;
    let resetRequest = {
      chargePointId: this.chargePointResponse?.id
    } as ResetCommand;

    this.subscription.add(
      this.chargePointsService
        .chargePointsIdResetPost(
          this.chargePointResponse.id,
          this.xApplicationClientId,
          resetRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate(
                'PAGES.CHARGE-POINTS.RESET-CHARGE-POINT-SUCCESS'
              )
            );
            this.buttonLoading = false;
            this.close();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.close();
            this.buttonLoading = false;
          },
          complete: () => {
            this.getChargePoint();
          }
        })
    );
  }

  async getConnectUrl(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const connectChargePointCommand: ConnectChargePointCommand = {
        chargePointId: this.chargePointId,
        identifier: this.chargePointResponse.identifier
      };
      this.subscription.add(
        this.chargePointsService
          .chargePointsIdConnectPost(
            this.chargePointId,
            this.xApplicationClientId,
            connectChargePointCommand
          )
          .subscribe({
            next: v => {
              let webSocketUrl = v.webSocketUrl;

              if (webSocketUrl.startsWith('wss://')) {
                this.secureConnectUrl = webSocketUrl;
                this.nonSecureConnectUrl = webSocketUrl.replace(
                  'wss://',
                  'ws://'
                );
              } else if (webSocketUrl.startsWith('ws://')) {
                this.nonSecureConnectUrl = webSocketUrl;
                this.secureConnectUrl = webSocketUrl.replace('ws://', 'wss://');
              }
              resolve();
            },
            error: err => {
              this.secureConnectUrl = null;
              this.nonSecureConnectUrl = null;
              this.notificationService.showErrorToast(this.handleError(err));
              resolve();
            },
            complete: () => {}
          })
      );
    });
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

  configureChargePoint() {
    this.router.navigate([
      '/charge-points',
      this.chargePointResponse?.id,
      'configuration'
    ]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.map) {
      this.map.dispose();
    }
  }
}
