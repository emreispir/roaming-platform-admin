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
  ChargeSessionDto,
  ChargeSessionStatus,
  ChargeSessionsService,
  InvoiceStatus,
  InvoicesService,
  RetryCreateInvoiceCommand,
  TariffType,
  TransactionDto,
  TransactionStatus,
  TransactionsService
} from '../../../../../api';
import { DownloadInvoiceCommand } from '../../../../../api/model/downloadInvoiceCommand';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import * as moment from 'moment';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import {
  DatePipe,
  DecimalPipe,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet
} from '@angular/common';
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
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgTemplateOutlet,
    RoundPipe,
    DecimalPipe,
    DatePipe
  ]
})
export class TransactionDetailComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  transactionResponse: TransactionDto;
  transactionId: string;

  transactionSessionResponse: ChargeSessionDto;
  sessionId: string;
  sessionStatus = ChargeSessionStatus;

  infoDescription: string;
  transactionStatus = TransactionStatus;
  tariffType = TariffType;

  invoiceStatus = InvoiceStatus;

  noInvoiceSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoInvoiceIcon.name, 'xxlarge none', true)
  );

  constructor(
    protected transactionService: TransactionsService,
    protected sessionService: ChargeSessionsService,
    protected invoiceService: InvoicesService,
    public sharedService: SharedService,
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
          this.sessionId = this.transactionResponse?.chargeSessionId;
          this.getTransactionSession();

          this.breadcrumbMenuItems = [
            { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
            {
              label: this.getDecodedUserToken()?.extension_Directory?.name,
              routerLink: '/dashboard'
            },
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
      this.sessionService.chargeSessionsIdGet(this.sessionId).subscribe({
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
    let invoiceDownloadRequest: DownloadInvoiceCommand = {} as DownloadInvoiceCommand;
    invoiceDownloadRequest.invoiceId = this.transactionResponse?.invoice?.id;

    this.loading = true;
    this.subscription.add(
      this.invoiceService
        .invoicesIdDownloadPost(
          this.transactionResponse?.invoice?.id,
          this.xApplicationClientId,
          invoiceDownloadRequest
        )
        .subscribe({
          next: v => {
            const blob = new Blob([v], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.download =
              this.transactionResponse?.user?.displayName +
              ' - ' +
              moment(this.transactionResponse?.invoice?.issueDate).format(
                'DD.MM.yyyy HH:mm'
              ) +
              '.pdf';
            anchor.href = blobUrl;
            document.body.appendChild(anchor);
            anchor.click();

            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.INVOICES.DOWNLOAD-SUCCESS')
            );
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

  retryCreateInvoice() {
    this.loading = true;
    let retryCommand: RetryCreateInvoiceCommand = {
      transactionId: this.transactionResponse?.id
    };
    this.subscription.add(
      this.transactionService
        .transactionsIdRetryCreateInvoicePost(
          this.transactionResponse?.id,
          this.xApplicationClientId,
          retryCommand
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.INVOICES.RETRY-CREATE-INVOICE-SUCCESS')
            );
            this.getTransaction();
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
