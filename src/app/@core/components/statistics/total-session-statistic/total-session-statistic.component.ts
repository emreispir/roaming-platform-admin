import { DecimalPipe, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CurrencyDto, ReportsService } from '../../../../../../api';
import { BaseComponent } from '../../../../shared/base.component';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { ReportWidgetCardComponent } from '../../report-widget-card/report-widget-card.component';
import * as moment from 'moment';

@Component({
  selector: 'app-total-session-statistic',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    DecimalPipe,
    NgIf,
    ReportWidgetCardComponent,
  ],
  templateUrl: './total-session-statistic.component.html',
  styleUrls: ['./total-session-statistic.component.scss'],
})
export class TotalSessionStatisticComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Input() directoryId: string;
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  @Input() userId: string;
  @Input() routePath: string;

  sessionsReportResponse: any;
  sessionLoading: boolean;
  currenciesData: any[];

  constructor(
    protected reportService: ReportsService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngOnInit(): void {
    let currencies = this.sharedService.getCurrencies();
    this.generateCurrenciesData(currencies);

    let message = {
      range: this.monthRange,
      item: this.currenciesData[0],
    };

    this.getSessionReport(message);
  }

  generateCurrenciesData(currencies: CurrencyDto[]): any {
    this.currenciesData = [];
    return currencies.forEach((currency) => {
      this.currenciesData.push({
        label: currency?.code,
        value: currency,
      });
    });
  }

  getSessionReport(message: any) {
    this.sessionLoading = true;
    this.subscription.add(
      this.reportService
        .reportsSessionsGet(
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
          next: (v) => {
            this.sessionsReportResponse = v;
          },
          error: (e) => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.sessionLoading = false;
          },
          complete: () => {
            this.sessionLoading = false;
          },
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
