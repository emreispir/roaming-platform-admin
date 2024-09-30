import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MenuModule } from 'primeng/menu';
import {
  CurrencyDto,
  Granularity,
  ReportsService
} from '../../../../../../api';
import * as moment from 'moment';
import { NotificationService } from '../../../services/notification.service';
import { BaseComponent } from '../../../../shared/base.component';
import { curveBasis } from 'd3-shape';
import { Policy } from '../../../models/policy';
import { DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../../assets/svg/svg-variables';
import { NgIf } from '@angular/common';
import { InfoPanelComponent } from '../../info-panel/info-panel.component';
import { LoaderComponent } from '../../loader/loader.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-total-energy-statistics',
  templateUrl: './total-energy-statistics.component.html',
  styleUrls: ['./total-energy-statistics.component.scss'],
  standalone: true,
  imports: [
    MenuModule,
    TranslateModule,
    NgIf,
    LoaderComponent,
    InfoPanelComponent,
    NgxChartsModule
  ]
})
export class TotalEnergyStatisticsComponent extends BaseComponent {
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  dateMenuItems: any;
  selectedDateRange: any;
  granularity: Granularity;
  chartLoading: boolean = true;
  totalEnergyChartColors = {
    domain: ['#2755f6']
  };
  totalEnergyChartsResponse: any[];
  currenciesData: any[];
  curve: any = curveBasis;

  noStatisticIcon = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoStatisticIcon.name,
      'xxxlarge none',
      true
    )
  );

  constructor(
    protected sharedService: SharedService,
    protected reportService: ReportsService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    private cd: ChangeDetectorRef,
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

    this.getTotalEnergiesReports(message);
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
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
          this.onSelect(this.selectedDateRange);
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
          this.onSelect(this.selectedDateRange);
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
          this.onSelect(this.selectedDateRange);
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
          this.onSelect(this.selectedDateRange);
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
          this.onSelect(this.selectedDateRange);
        }
      }
    );

    return this.dateMenuItems;
  }

  getTotalEnergiesReports(message: any) {
    if (this.isUserValidForPolicies([Policy.TransactionRead])) {
      this.chartLoading = true;

      this.subscription.add(
        this.reportService
          .reportsTotalEnergyChartsGet(
            moment(message?.range?.startDate)
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            moment(message?.range?.endDate)
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            this.granularity,
            this.workspaceId,
            this.chargePointId,
            this.xApplicationClientId
          )
          .subscribe({
            next: v => {
              this.totalEnergyChartsResponse = [];

              if (v?.data?.length > 0) {
                let seriesData = v?.data;

                // If there's only one data point, add a duplicate with a slightly different x-value
                if (seriesData.length === 1) {
                  const singlePoint = seriesData[0];
                  const duplicatePoint = {
                    ...singlePoint,
                    name: this.getTranslate('COMMON.PRESENT-MOMENT')
                  };
                  seriesData.push(duplicatePoint);
                }

                this.totalEnergyChartsResponse = [
                  {
                    name: this.getTranslate('PAGES.SESSIONS.TOTAL-ENERGY'),
                    series: seriesData
                  }
                ];
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
    this.getTotalEnergiesReports(value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
