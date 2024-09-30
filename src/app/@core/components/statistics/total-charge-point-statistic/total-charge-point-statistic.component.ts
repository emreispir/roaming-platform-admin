import { DecimalPipe, NgIf } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportsService } from '../../../../../../api';
import { BaseComponent } from '../../../../shared/base.component';
import { NotificationService } from '../../../services/notification.service';
import { ReportWidgetCardComponent } from '../../report-widget-card/report-widget-card.component';

@Component({
  selector: 'app-total-charge-point-statistic',
  standalone: true,
  imports: [TranslateModule, NgIf, DecimalPipe, ReportWidgetCardComponent],
  templateUrl: './total-charge-point-statistic.component.html',
  styleUrls: ['./total-charge-point-statistic.component.scss']
})
export class TotalChargePointStatisticComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() directoryId: string;
  @Input() workspaceId: string;
  @Input() routePath: string;

  chargePointLoading: boolean;
  totalChargePointReportResponse: any;

  constructor(
    protected reportService: ReportsService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    public activatedRoute: ActivatedRoute
  ) {
    super(translateService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.directoryId && changes?.directoryId?.currentValue) {
      if (this.directoryId) {
        this.getTotalChargePointReport();
      }
    }
  }

  getTotalChargePointReport() {
    this.chargePointLoading = true;
    this.subscription.add(
      this.reportService
        .reportsTotalChargePointsGet(
          this.directoryId,
          this.workspaceId,
          null,
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.totalChargePointReportResponse = v;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.chargePointLoading = false;
          },
          complete: () => {
            this.chargePointLoading = false;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
