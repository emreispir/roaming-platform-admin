import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { DecimalPipe, NgClass, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ReportsService, CurrencyDto } from '../../../../../../api';
import { IconsArray } from '../../../../../assets/svg/svg-variables';
import { NotificationService } from '../../../services/notification.service';
import { MenuModule } from 'primeng/menu';
import * as moment from 'moment';
import { LoaderComponent } from '../../loader/loader.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-overview-statistic',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    NgClass,
    LoaderComponent,
    DecimalPipe,
    MenuModule
  ],
  templateUrl: './overview-statistic.component.html',
  styleUrls: ['./overview-statistic.component.scss']
})
export class OverviewStatisticComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() directoryId: string;
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  @Input() siteHostId: string;
  @Input() userId: string;
  @Input() isRowOverview: boolean;

  faultAndLosesReportResponse: any;
  totalRevenuesReportResponse: any;
  totalEnergyReportResponse: any;

  overviewLoading: boolean = true;

  totalEnergyIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.TotalEnergyIcon.name, '', true)
  );
  totalRevenueIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.TotalRevenueIcon.name, '', true)
  );
  unavailableIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.UnavailableIcon.name, '', true)
  );

  currenciesData: any[];
  dateMenuItems: any;
  selectedDateRange: any;

  constructor(
    protected sharedService: SharedService,
    protected reportService: ReportsService,
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.directoryId && changes?.directoryId?.currentValue) {
      if (this.directoryId) {
        let message = {
          range: this.monthRange,
          item: this.currenciesData[0]
        };

        this.getRevenueReport(message);
        this.getFaultReport(message);
      }
    }
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

  onSelect(event) {
    let value = {
      range: this.selectedDateRange,
      item: this.currenciesData[0]
    };
    this.getRevenueReport(value);
  }

  getRevenueReport(message: any) {
    this.overviewLoading = true;
    this.subscription.add(
      this.reportService
        .reportsTotalRevenueGet(
          message?.item?.value?.id,
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          this.siteHostId,
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
            this.totalRevenuesReportResponse = v;

            this.getTotalEnergyReport(message);
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.overviewLoading = false;
          },
          complete: () => {}
        })
    );
  }

  getTotalEnergyReport(message: any) {
    this.subscription.add(
      this.reportService
        .reportsTotalEnergyGet(
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          this.userId,
          this.siteHostId,
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
            this.totalEnergyReportResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.overviewLoading = false;
          },
          complete: () => {
            this.overviewLoading = false;
          }
        })
    );
  }

  getFaultReport(message: any) {
    this.subscription.add(
      this.reportService
        .reportsFaultsGet(
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          null,
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.faultAndLosesReportResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.overviewLoading = false;
          },
          complete: () => {
            this.overviewLoading = false;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
