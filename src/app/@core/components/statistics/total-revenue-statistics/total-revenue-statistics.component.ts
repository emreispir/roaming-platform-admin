import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { BaseComponent } from '../../../../shared/base.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {
  CurrenciesService,
  CurrencyDto,
  Granularity,
  ReportsService
} from '../../../../../../api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { Policy } from '../../../models/policy';
import { MenuModule } from 'primeng/menu';
import { IconsArray } from '../../../../../assets/svg/svg-variables';
import { DomSanitizer } from '@angular/platform-browser';
import { NgIf } from '@angular/common';
import { LoaderComponent } from '../../loader/loader.component';
import { InfoPanelComponent } from '../../info-panel/info-panel.component';

@Component({
  selector: 'app-total-revenue-statistics',
  templateUrl: './total-revenue-statistics.component.html',
  styleUrls: ['./total-revenue-statistics.component.scss'],
  standalone: true,
  imports: [
    NgxChartsModule,
    MenuModule,
    TranslateModule,
    NgIf,
    LoaderComponent,
    InfoPanelComponent
  ]
})
export class TotalRevenueStatisticsComponent extends BaseComponent {
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  dateMenuItems: any;
  selectedDateRange: any;
  granularity: Granularity;
  chartLoading: boolean = true;
  totalRevenueChartColors = {
    domain: ['#4fa10d']
  };
  totalRevenueChartsResponse: any[];
  currenciesData: any[];

  noStatisticIcon = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoStatisticIcon.name,
      'xxxlarge none',
      true
    )
  );

  constructor(
    protected reportService: ReportsService,
    protected currencyService: CurrenciesService,
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    private sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.selectedDateRange = {
      label: this.getTranslate('COMMON.MONTHLY'),
      startDate: moment()
        .startOf('month')
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      endDate: moment()
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    };
    this.granularity = Granularity.Day;

    let currencies = this.sharedService.getCurrencies();
    this.generateCurrenciesData(currencies);

    let message = {
      range: this.monthRange,
      item: this.currenciesData[0]
    };

    this.getTotalRevenuesReports(message);
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

  generateDateMenuItems(): any {
    this.dateMenuItems = [
      {
        label: this.getTranslate('COMMON.DAILY'),
        command: () => {
          this.granularity = Granularity.Hour;
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.DAILY'),
            startDate: moment()
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onSelect({
            range: this.selectedDateRange,
            item: this.currenciesData[0]
          });
        }
      },
      {
        label: this.getTranslate('COMMON.WEEKLY'),
        command: () => {
          this.granularity = Granularity.Day;
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.WEEKLY'),
            startDate: moment()
              .subtract(7, 'day')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onSelect({
            range: this.selectedDateRange,
            item: this.currenciesData[0]
          });
        }
      },
      {
        label: this.getTranslate('COMMON.MONTHLY'),
        command: () => {
          this.granularity = Granularity.Day;
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.MONTHLY'),
            startDate: moment()
              .startOf('month')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onSelect({
            range: this.selectedDateRange,
            item: this.currenciesData[0]
          });
        }
      }
    ];
    this.dateMenuItems.push(
      {
        label: this.getTranslate('COMMON.LAST-THREE-MONTH'),
        command: () => {
          this.granularity = Granularity.Month;
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.LAST-THREE-MONTH'),
            startDate: moment()
              .subtract(3, 'months')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onSelect({
            range: this.selectedDateRange,
            item: this.currenciesData[0]
          });
        }
      },
      {
        label: this.getTranslate('COMMON.YEARLY'),
        command: () => {
          this.granularity = Granularity.Month;
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.YEARLY'),
            startDate: moment()
              .subtract(1, 'year')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onSelect({
            range: this.selectedDateRange,
            item: this.currenciesData[0]
          });
        }
      }
    );

    return this.dateMenuItems;
  }

  getTotalRevenuesReports(message: any) {
    if (this.isUserValidForPolicies([Policy.TransactionRead])) {
      this.chartLoading = true;

      this.subscription.add(
        this.reportService
          .reportsTotalRevenueChartsGet(
            moment(message?.range?.startDate)
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            moment(message?.range?.endDate)
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            this.granularity,
            this.chargePointId,
            this.workspaceId,
            this.xApplicationClientId
          )
          .subscribe({
            next: v => {
              this.totalRevenueChartsResponse = [];
              if (v?.data?.length > 0) {
                this.totalRevenueChartsResponse = v;
              }
              this.chartLoading = false;
            },
            error: e => {
              this.notificationService.showErrorToast(this.handleError(e));
              this.chartLoading = false;
            },
            complete: () => {}
          })
      );
    }
  }

  onSelect(event) {
    let value = {
      range: this.selectedDateRange,
      item: this.currenciesData[0]
    };
    this.getTotalRevenuesReports(value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
