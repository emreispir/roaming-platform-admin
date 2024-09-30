import { DatePipe, NgIf } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  ChargePointStatus,
  ChargeSessionDto,
  ChargeSessionsService,
  ChargeSessionStatus,
  CurrencyDto
} from '../../../../../api';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { SignalRService } from '../../../@core/services/signalr.service';
import { BaseComponent } from '../../../shared/base.component';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { RoundPipe } from '../../../@theme/pipes';
import * as moment from 'moment';
import { DataTableComponent, CardWithAvatarComponent } from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-latest-session-list',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    LoaderComponent,
    InfoCardComponent,
    DataTableComponent
  ],
  templateUrl: './latest-session-list.component.html',
  styleUrls: ['./latest-session-list.component.scss']
})
export class LatestSessionListComponent extends BaseComponent
  implements OnChanges, OnDestroy, OnInit {
  @Input() directoryId: string;
  @Input() chargePointId: string;
  @Input() workspaceId: string;
  @Input() userId: string;
  @Input() pageSize: number = 7;

  chargeSessionsLoading: boolean;
  sessionsResponse: ChargeSessionDto[] = [];
  currenciesData: any[];
  statusTypes = ChargeSessionStatus;
  noSessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoSessionIcon.name,
      'xxxlarge dark-blue',
      true
    )
  );

  roundPipe = new RoundPipe();
  datePipe = new DatePipe(this.sharedService.language);

  constructor(
    protected signalRService: SignalRService,
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
        this.getSessions(this.page, this.pageSize);
      }
    }
  }

  ngOnInit(): void {
    this.tableConfig.lazy = false;
    this.tableConfig.isPaginated = false;
    this.tableConfig.loadLazy = null;

    if (!this.signalRService.isConnected()) {
      this.subscription.add(
        this.signalRService.connectHub().subscribe(connected => {
          if (connected) {
            this.subscribeToSignalrData();
          } else {
            console.error('SignalR connection could not be established.');
          }
        })
      );
    } else {
      this.subscribeToSignalrData();
    }
  }

  getSessions(page: number, size: number) {
    this.chargeSessionsLoading = true;

    this.subscription.add(
      this.chargeSessionsService
        .chargeSessionsGet(
          page,
          size,
          null,
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          this.userId,
          moment(this.monthRangeDate?.startDate)
            ?.startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          moment(this.monthRangeDate?.endDate)
            ?.endOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.sessionsResponse = v.items;

            this.generateDataTable();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.chargeSessionsLoading = false;
          },
          complete: () => {}
        })
    );
  }

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'readableId',
        header: this.getTranslate('PAGES.SESSIONS.SESSION-ID'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{readableId}}',
          tagValue: item =>
            this.getEnumTypeTranslation(ChargePointStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          // routePath: '/sessions/{{id}}'
        }
      },
      {
        field: 'endDate',
        header: this.getTranslate('COMMON.END-DATE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) => {
            if (item?.endDate) {
              return this.datePipe.transform(
                item?.endDate,
                'dd MMM y HH:mm',
                this.sharedService.language
              );
            } else {
              return this.getTranslate('ENUM.INPROGRESS');
            }
          }
        },
        templateConfig: {
          titleStyleClass: item =>
            !item.endDate ? 'text-charging bold truncate' : 'fw-normal truncate'
        }
      },

      {
        field: '',
        header: this.getTranslate('PAGES.SESSIONS.DURATION'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) => {
            if (item?.status === ChargeSessionStatus.Charging) {
              return (
                this.dateDifference(item?.startDate, this.dateNow.toString()) ||
                '-'
              );
            } else {
              return this.dateDifference(item?.startDate, item?.endDate) || '-';
            }
          }
        },
        templateConfig: {
          titleStyleClass: 'fw-normal'
        }
      },
      {
        field: '',
        header: `${this.getTranslate(
          'PAGES.SESSIONS.USAGE'
        )}(${this.getTranslate('PAGES.SESSIONS.KWH')})`,
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) =>
            this.roundPipe.transform(
              item?.chargeSessionData?.calculatedKWH,
              3
            ) || '0'
        },
        templateConfig: {
          titleStyleClass: 'fw-normal'
        }
      }
    ];

    this.chargeSessionsLoading = false;
  }

  subscribeToSignalrData() {
    this.subscription.add(
      this.signalRService?.chargeSessionHub.subscribe({
        next: v => {
          if (v) {
            const existingSessionIndex = this.sessionsResponse?.findIndex(
              session => session.id === v.id
            );
            if (existingSessionIndex !== -1) {
              this.sessionsResponse[existingSessionIndex] = v;
            } else {
              this.sessionsResponse?.unshift(v);
              this.sessionsResponse?.pop();
            }

            this.generateDataTable();
          }
        },
        error: e => {
          console.error('Failed to chargeSessionHub data:', e);
        },
        complete: () => {}
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
