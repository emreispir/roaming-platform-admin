import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { BaseComponent } from '../../../shared/base.component';
import {
  InvoiceStatus,
  RoamingSessionDto,
  RoamingSessionsService,
  RoamingSessionStatus,
  RoamingTransactionDto,
  RoamingTransactionsService,
  TariffType,
  TransactionStatus
} from '../../../../../api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import * as moment from 'moment';
import {
  NgIf,
  NgClass,
  DatePipe,
  DecimalPipe,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault
} from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { RoundPipe } from '../../../@theme/pipes';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    InfoCardComponent,
    LoaderComponent,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ReactiveFormsModule,
    FormsModule,
    RoundPipe,
    DatePipe,
    DecimalPipe
  ]
})
export class TransactionDetailComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  transactionResponse: RoamingTransactionDto;
  transactionId: string;

  transactionSessionResponse: RoamingSessionDto;
  sessionId: string;
  sessionStatus = RoamingSessionStatus;

  infoDescription: string;
  transactionStatus = TransactionStatus;
  tariffType = TariffType;

  invoiceStatus = InvoiceStatus;

  noInvoiceSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoInvoiceIcon.name, 'xxlarge none', true)
  );

  constructor(
    protected transactionService: RoamingTransactionsService,
    protected sessionService: RoamingSessionsService,
    // protected invoiceService: InvoicesService,
    protected sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  init() {
    this.subscription.add(
      this.activatedRoute.params.subscribe(params => {
        this.transactionId = params['id'];
        this.getTransaction();
      })
    );
  }

  getTransaction() {
    this.loading = true;
    this.subscription.add(
      this.transactionService.transactionsIdGet(this.transactionId).subscribe({
        next: v => {
          this.transactionResponse = v;
          this.sessionId = this.transactionResponse?.chargePointInterestSessionId;
          this.getTransactionSession();

          this.breadcrumbMenuItems = [
            { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
            {
              label: this.getTranslate('PAGES.TRANSACTIONS.TITLE'),
              routerLink: '/transactions'
            },
            { label: this.transactionResponse?.readableId }
          ];

          this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

          let tagColor;
          switch (this.transactionResponse?.status) {
            case TransactionStatus.Pending:
              tagColor = 'orange';
              break;
            case TransactionStatus.Undefined:
              tagColor = 'gray';
              break;
            case TransactionStatus.Failed:
              tagColor = 'red';
              break;
            case TransactionStatus.Refunded:
              tagColor = 'orange';
              break;
            case TransactionStatus.Success:
              tagColor = 'blue';
              break;
            case TransactionStatus.SuccessWithoutPayment:
              tagColor = 'green';
              break;
            case TransactionStatus.WaitingForPayment:
              tagColor = 'orange';
              break;
            case TransactionStatus.WaitingForPaymentApproval:
              tagColor = 'orange';
              break;
          }
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.loading = false;
        },
        complete: () => {}
      })
    );
  }

  getTransactionSession() {
    this.loading = true;
    this.subscription.add(
      this.sessionService.sessionsIdGet(this.sessionId).subscribe({
        next: v => {
          this.transactionSessionResponse = v;
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      })
    );
  }

  downloadInvoice() {
    // let invoiceDownloadRequest: DownloadInvoiceCommand = {} as DownloadInvoiceCommand;
    // invoiceDownloadRequest.invoiceId = this.transactionResponse?.invoice?.id;
    // this.loading = true;
    // this.subscription.add(
    //   this.invoiceService
    //     .invoicesIdDownloadPost(
    //       this.transactionResponse?.invoice?.id,
    //       this.xApplicationClientId,
    //       invoiceDownloadRequest
    //     )
    //     .subscribe({
    //       next: v => {
    //         const blob = new Blob([v], { type: 'application/pdf' });
    //         const blobUrl = window.URL.createObjectURL(blob);
    //         const anchor = document.createElement('a');
    //         anchor.download =
    //           this.transactionResponse?.user?.displayName +
    //           ' - ' +
    //           moment(this.transactionResponse?.invoice?.issueDate).format(
    //             'DD.MM.yyyy HH:mm'
    //           ) +
    //           '.pdf';
    //         anchor.href = blobUrl;
    //         document.body.appendChild(anchor);
    //         anchor.click();
    //         this.notificationService.showSuccessToast(
    //           this.getTranslate('PAGES.INVOICES.DOWNLOAD-SUCCESS')
    //         );
    //       },
    //       error: e => {
    //         this.notificationService.showErrorToast(this.handleError(e));
    //         this.loading = false;
    //       },
    //       complete: () => {
    //         this.loading = false;
    //       }
    //     })
    // );
  }

  retryCreateInvoice() {
    // this.loading = true;
    // let retryCommand: RetryCreateInvoiceCommand = {
    //   transactionId: this.transactionResponse?.id
    // };
    // this.subscription.add(
    //   this.transactionService
    //     .transactionsIdRetryCreateInvoicePost(
    //       this.transactionResponse?.id,
    //       this.xApplicationClientId,
    //       retryCommand
    //     )
    //     .subscribe({
    //       next: v => {
    //         this.notificationService.showSuccessToast(
    //           this.getTranslate('PAGES.INVOICES.RETRY-CREATE-INVOICE-SUCCESS')
    //         );
    //         this.getTransaction();
    //       },
    //       error: e => {
    //         this.notificationService.showErrorToast(this.handleError(e));
    //         this.loading = false;
    //       },
    //       complete: () => {
    //         this.loading = false;
    //       }
    //     })
    // );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
