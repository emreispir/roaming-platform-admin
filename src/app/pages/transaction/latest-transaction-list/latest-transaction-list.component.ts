import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  TransactionsService,
  CurrencyDto,
  TransactionDto,
  ChargeSessionDto
} from '../../../../../api';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { SignalRService } from '../../../@core/services/signalr.service';
import { BaseComponent } from '../../../shared/base.component';
import { RoundPipe } from '../../../@theme/pipes';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import * as moment from 'moment';
import { DataTableComponent, CardWithAvatarComponent } from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-latest-transaction-list',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    LoaderComponent,
    InfoCardComponent,
    DataTableComponent
  ],
  templateUrl: './latest-transaction-list.component.html',
  styleUrls: ['./latest-transaction-list.component.scss']
})
export class LatestTransactionListComponent extends BaseComponent
  implements OnChanges, OnDestroy, OnInit {
  @Input() directoryId: string;
  @Input() chargePointId: string;
  @Input() userId: string;
  @Input() pageSize: number = 7;

  noTransactionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoTransactionIcon.name,
      'xxxlarge dark-blue',
      true
    )
  );

  transactionLoading: boolean;
  transactionsResponse: TransactionDto[] = [];
  currenciesData: any[];

  roundPipe = new RoundPipe();

  constructor(
    protected signalRService: SignalRService,
    protected transactionsService: TransactionsService,
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
        this.getTransactions();
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

  getTransactions() {
    this.transactionLoading = true;
    this.subscription.add(
      this.transactionsService
        .transactionsGet(
          this.page,
          this.pageSize,
          null,
          this.directoryId,
          null,
          this.chargePointId,
          moment(this.monthRangeDate?.startDate)
            ?.startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          moment(this.monthRangeDate?.endDate)
            ?.endOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          this.userId,
          null,
          null,
          null,
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.transactionsResponse = v.items;
            this.generateDataTable();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.transactionLoading = false;
          },
          complete: () => {}
        })
    );
  }

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'readableId',
        header: this.getTranslate('PAGES.TRANSACTIONS.TRANSACTION-ID'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{readableId}}'
        },
        templateConfig: {
          // routePath: '/transactions/{{id}}'
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.SESSIONS.DURATION'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) =>
            this.dateDifference(
              item?.chargeSessionData?.startMeterTime,
              item?.chargeSessionData?.stopMeterTime
            )
        },
        templateConfig: {
          titleStyleClass: 'fw-normal'
        }
      },

      {
        field: '',
        header: `${this.getTranslate(
          'PAGES.TRANSACTIONS.USAGE'
        )}(${this.getTranslate('PAGES.SESSIONS.KWH')})`,
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: TransactionDto) =>
            this.roundPipe.transform(item?.totalKWH, 3) || '0'
        },
        templateConfig: {
          titleStyleClass: 'fw-normal'
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.TRANSACTIONS.AMOUNT'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: TransactionDto) =>
            `${item?.currency?.symbol}${item?.totalAmount}` || '0'
        },
        templatePipes: {
          title: [
            {
              name: DecimalPipe,
              args: ['1.2-2'],
              inputFields: ['totalAmount']
            }
          ]
        },
        templateConfig: {
          titleStyleClass: 'fw-normal'
        }
      }
    ];

    this.transactionLoading = false;
  }

  subscribeToSignalrData() {
    this.subscription.add(
      this.signalRService?.transactionCreatedHub.subscribe({
        next: v => {
          if (v) {
            const existingTransactionIndex = this.transactionsResponse?.findIndex(
              transaction => transaction.id === v.id
            );
            if (existingTransactionIndex !== -1) {
              this.transactionsResponse[existingTransactionIndex] = v;
            } else {
              this.transactionsResponse?.unshift(v);
              this.transactionsResponse?.pop();
            }

            this.generateDataTable();
          }
        },
        error: e => {
          console.error('Failed to transactionCreatedHub data:', e);
        },
        complete: () => {}
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
