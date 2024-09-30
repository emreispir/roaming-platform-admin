import { NgIf, DecimalPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyDto, ReportsService } from '../../../../../../api';
import { BaseComponent } from '../../../../shared/base.component';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { ReportWidgetCardComponent } from '../../report-widget-card/report-widget-card.component';
import * as moment from 'moment';

@Component({
  selector: 'app-total-transaction-statistic',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    DecimalPipe,
    ReportWidgetCardComponent
  ],
  templateUrl: './total-transaction-statistic.component.html',
  styleUrls: ['./total-transaction-statistic.component.scss']
})
export class TotalTransactionStatisticComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() directoryId: string;
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  @Input() userId: string;
  @Input() routePath: string;
  @Input() tooltipContent: string;

  transactionReportLoading: boolean;
  transactionsReportResponse: any;
  currenciesData: any[];

  constructor(
    protected reportService: ReportsService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    super(translateService);
    this.init();
  }

  init() {
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
        let message = {
          range: this.monthRange,
          item: this.currenciesData[0]
        };

        this.getTransactionReport(message);
      }
    }
  }

  getTransactionReport(message: any) {
    this.transactionReportLoading = true;
    this.subscription.add(
      this.reportService
        .reportsTransactionsGet(
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          this.userId,
          moment(message?.range?.startDate)
            .startOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          moment(message?.range?.endDate)
            .endOf('day')
            .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.transactionsReportResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.transactionReportLoading = false;
          },
          complete: () => {
            this.transactionReportLoading = false;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
