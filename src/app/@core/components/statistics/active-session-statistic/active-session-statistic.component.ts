import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../shared/base.component';
import { DecimalPipe, NgIf } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChargeSessionStatus, ReportsService } from '../../../../../../api';
import { NotificationService } from '../../../services/notification.service';
import { SharedService } from '../../../services/shared.service';
import { ReportWidgetCardComponent } from '../../report-widget-card/report-widget-card.component';

@Component({
  selector: 'app-active-session-statistic',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    DecimalPipe,
    NgIf,
    ReportWidgetCardComponent,
  ],
  templateUrl: './active-session-statistic.component.html',
  styleUrls: ['./active-session-statistic.component.scss'],
})
export class ActiveSessionStatisticComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Input() directoryId: string;
  @Input() workspaceId: string;
  @Input() chargePointId: string;
  @Input() routePath: string;

  statusTypes = ChargeSessionStatus;
  activeSessionLoading: boolean;
  activeSessionsReportResponse: any;

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
    this.getActiveSessionReport();
  }

  getActiveSessionReport() {
    this.activeSessionLoading = true;
    this.subscription.add(
      this.reportService
        .reportsActiveSessionsGet(
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
          this.xApplicationClientId
        )
        .subscribe({
          next: (v) => {
            this.activeSessionsReportResponse = v;
          },
          error: (e) => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.activeSessionLoading = false;
          },
          complete: () => {
            this.activeSessionLoading = false;
          },
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
