import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ChargeSessionStatus,
  ChargeSessionDto,
  CurrencyDto,
  ChargePointsService,
  ChargeSessionsService
} from '../../../../../api';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { SignalRService } from '../../../@core/services/signalr.service';
import { BaseComponent } from '../../../shared/base.component';
import { RoundPipe } from '../../../@theme/pipes';
import * as moment from 'moment';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { OverwiewCardComponent } from '../../../@core/components/overwiew-card/overwiew-card.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-active-sessions',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    NgFor,
    LoaderComponent,
    OverwiewCardComponent,
    InfoCardComponent
  ],
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss']
})
export class ActiveSessionsComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() directoryId: string;
  @Input() chargePointId: string;
  @Input() isChargePoint: string;
  @Input() userId: string;

  currenciesData: any[];
  statusTypes = ChargeSessionStatus;
  lastActiveSessionsLoading: boolean;
  lastActiveSessionsResponse: ChargeSessionDto[];

  stationSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoSessionIcon.name,
      'xxxlarge dark-blue',
      true
    )
  );

  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-blue')
  );

  roundPipe = new RoundPipe();

  constructor(
    protected signalRService: SignalRService,
    protected chargePointsService: ChargePointsService,
    protected chargeSessionsService: ChargeSessionsService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init(): void {
    let currencies = this.sharedService.getCurrencies();
    this.generateCurrenciesData(currencies);
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.directoryId && changes?.directoryId?.currentValue) {
      if (this.directoryId) {
        this.getLastActiveSessions(this.page, 3);
      }
    }
  }

  getLastActiveSessions(page: number, pageSize: number) {
    this.lastActiveSessionsLoading = true;
    this.subscription.add(
      (this.isChargePoint
        ? this.chargePointsService.chargePointsIdActiveSessionsGet(
            this.chargePointId,
            page,
            pageSize,
            this.chargePointId,
            this.xApplicationClientId
          )
        : this.chargeSessionsService.chargeSessionsGet(
            page,
            pageSize,
            null,
            this.directoryId,
            null,
            null,
            this.userId,
            moment(this.monthRangeDate?.startDate)
              ?.startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            moment(this.monthRangeDate?.endDate)
              ?.endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            ChargeSessionStatus.Charging,
            this.xApplicationClientId
          )
      ).subscribe({
        next: v => {
          this.lastActiveSessionsResponse = [];
          this.lastActiveSessionsResponse = v.items;
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.lastActiveSessionsLoading = false;
        },
        complete: () => {
          this.lastActiveSessionsLoading = false;
        }
      })
    );
  }

  generateTagsResponse(session: ChargeSessionDto): any {
    const startMeterTime = moment(session.chargeSessionData?.startMeterTime);
    const currentTime = moment();
    const duration = moment.duration(currentTime.diff(startMeterTime));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    return [
      { icon: null, text: '#' + session?.connectorNumber },
      { icon: null, text: `${hours} h ${minutes} m`, color: 'blue' },
      {
        icon: null,
        text:
          this.roundPipe.transform(
            session?.chargeSessionData?.calculatedKWH,
            3
          ) + this.getTranslate('PAGES.SESSIONS.KWH')
      },
      { icon: null, text: session?.plateNo }
    ];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
