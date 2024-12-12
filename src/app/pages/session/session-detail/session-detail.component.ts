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
  ChargePointStatus,
  ChargingLevel,
  ChargingPowerType,
  RoamingSessionDto,
  RoamingSessionsService,
  RoamingSessionStatus,
  RoamingTransactionDto,
  RoamingTransactionsService,
  TariffType,
  TransactionStatus
} from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons } from '../../../../assets/svg/svg-variables';
import * as atlas from 'azure-maps-control';
import {
  NgIf,
  NgClass,
  DatePipe,
  DecimalPipe,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault
} from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { RoundPipe } from '../../../@theme/pipes';
import { SurgeAvatarComponent } from 'surge-components';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    LoaderComponent,
    SurgeAvatarComponent,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ReactiveFormsModule,
    FormsModule,
    RoundPipe,
    DatePipe,
    DecimalPipe
  ]
})
export class SessionDetailComponent extends BaseComponent
  implements AfterViewInit, OnDestroy {
  sessionResponse: RoamingSessionDto;
  sessionId: string;

  infoDescription: string;
  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );

  chargingLevel = ChargingLevel;
  chargingPowerType = ChargingPowerType;

  tariffType = TariffType;
  basePriceType = BasePriceType;
  estimatedTransactionResponse: RoamingTransactionDto;
  transactionResponse: RoamingTransactionDto;
  sessionStatusTypes = RoamingSessionStatus;
  transactionStatus = TransactionStatus;

  constructor(
    protected transactionService: RoamingTransactionsService,
    protected sessionService: RoamingSessionsService,
    protected sharedService: SharedService,
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
      this.sessionService.sessionsIdGet(this.sessionId).subscribe({
        next: v => {
          this.sessionResponse = v;

          if (this.sessionResponse?.status !== RoamingSessionStatus.Completed) {
            this.getEstimatedTransaction();
          } else {
            this.getSessionTransaction();
          }

          if (
            this.sessionResponse?.chargePointInterest?.longitude &&
            this.sessionResponse?.chargePointInterest?.latitude
          ) {
            let position: atlas.data.Position;
            position = new atlas.data.Position(
              Number(this.sessionResponse?.chargePointInterest?.longitude),
              Number(this.sessionResponse?.chargePointInterest?.latitude)
            );
            this.mapOptions.center = position;
            this.initializeMap();
          }

          this.breadcrumbMenuItems = [
            { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
            {
              label: this.getTranslate('PAGES.SESSIONS.TITLE'),
              routerLink: '/sessions'
            },
            { label: this.sessionResponse?.readableId }
          ];

          this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

          let tagColor;
          switch (this.sessionResponse?.status) {
            case RoamingSessionStatus.Charging:
              tagColor = 'blue';
              break;
            case RoamingSessionStatus.Undefined:
              tagColor = 'gray';
              break;
            case RoamingSessionStatus.Faulted:
              tagColor = 'red';
              break;
            case RoamingSessionStatus.Completed:
              tagColor = 'gray';
              break;
          }

          let chargePointTagColor;
          switch (this.sessionResponse?.chargePointInterest?.status) {
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
        .transactionsIdGet(this.sessionResponse?.transactionId)
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
        .sessionsIdEstimatedTransactionGet(this.sessionId)
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
