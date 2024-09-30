import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy
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
import { BaseComponent } from '../../../shared/base.component';
import {
  BasePriceType,
  ChargePointProtocol,
  ChargePointStatus,
  ChargeSessionDto,
  ChargeSessionsService,
  ChargeSessionStatus,
  ChargingLevel,
  ChargingMode,
  ChargingPowerType,
  TariffType,
  TransactionDto,
  TransactionsService,
  TransactionStatus
} from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons } from '../../../../assets/svg/svg-variables';
import * as atlas from 'azure-maps-control';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { SurgeAvatarComponent } from 'surge-components';
import {
  DatePipe,
  DecimalPipe,
  NgClass,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet
} from '@angular/common';
import { RoundPipe } from '../../../@theme/pipes';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    HeaderPanelComponent,
    LoaderComponent,
    SurgeAvatarComponent,
    NgTemplateOutlet,
    DecimalPipe,
    DatePipe,
    RoundPipe
  ]
})
export class SessionDetailComponent extends BaseComponent
  implements AfterViewInit, OnDestroy {
  sessionResponse: ChargeSessionDto;
  sessionId: string;

  infoDescription: string;
  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );

  chargingLevel = ChargingLevel;
  chargingPowerType = ChargingPowerType;
  chargePointProtocol = ChargePointProtocol;
  chargingMode = ChargingMode;

  tariffType = TariffType;
  basePriceType = BasePriceType;
  estimatedTransactionResponse: TransactionDto;
  transactionResponse: TransactionDto;
  sessionStatusTypes = ChargeSessionStatus;
  transactionStatus = TransactionStatus;

  constructor(
    protected transactionService: TransactionsService,
    protected sessionService: ChargeSessionsService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        this.sessionId = params['id'];
        this.getSession();
      })
    );
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
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

    this.point = new atlas.Shape(new atlas.data.Point(coords));
    this.dataSource.add([this.point]);

    this.map.setCamera({
      center: [coords[0], coords[1]],
      duration: 1000,
      type: 'fly'
    });
  }

  getSession() {
    this.loading = true;
    this.subscription.add(
      this.sessionService.chargeSessionsIdGet(this.sessionId).subscribe({
        next: v => {
          this.sessionResponse = v;

          if (this.sessionResponse?.status !== ChargeSessionStatus.Completed) {
            this.getEstimatedTransaction();
          } else {
            this.getSessionTransaction();
          }

          if (
            this.sessionResponse?.chargePoint?.address?.longitude &&
            this.sessionResponse?.chargePoint?.address?.latitude
          ) {
            let position: atlas.data.Position;
            position = new atlas.data.Position(
              Number(this.sessionResponse?.chargePoint?.address?.longitude),
              Number(this.sessionResponse?.chargePoint?.address?.latitude)
            );
            this.mapOptions.center = position;
            this.initializeMap();
          }

          this.breadcrumbMenuItems = [
            { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
            {
              label: this.getDecodedUserToken()?.extension_Directory?.name,
              routerLink: '/dashboard'
            },
            {
              label: this.getTranslate('PAGES.SESSIONS.TITLE'),
              routerLink: '/sessions'
            },
            { label: this.sessionResponse?.readableId }
          ];

          this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

          let tagColor;
          switch (this.sessionResponse?.status) {
            case ChargeSessionStatus.Charging:
              tagColor = 'blue';
              break;
            case ChargeSessionStatus.Undefined:
              tagColor = 'gray';
              break;
            case ChargeSessionStatus.Faulted:
              tagColor = 'red';
              break;
            case ChargeSessionStatus.Completed:
              tagColor = 'gray';
              break;
          }

          let chargePointTagColor;
          switch (this.sessionResponse?.chargePoint?.status) {
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
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.loading = false;
        },
        complete: () => {}
      })
    );
  }

  getSessionTransaction() {
    this.loading = true;
    this.subscription.add(
      this.transactionService
        .transactionsIdGet(
          this.sessionResponse?.transactionId,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.transactionResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        })
    );
  }

  getEstimatedTransaction() {
    this.loading = true;
    this.subscription.add(
      this.sessionService
        .chargeSessionsIdEstimatedTransactionGet(
          this.sessionId,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.estimatedTransactionResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
