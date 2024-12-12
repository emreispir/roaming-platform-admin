import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import {
  RetryRoamingTransactionCommand,
  RoamingTransactionDto,
  RoamingTransactionsService,
  TransactionStatus
} from '../../../../../api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import * as moment from 'moment';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { Subject, Subscription, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  DatePipe,
  DecimalPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import { RoundPipe } from '../../../@theme/pipes';
import {
  CardWithAvatarComponent,
  DynamicElementComponent,
  ElementType,
  DataTableComponent,
  DynamicMenuComponent
} from 'surge-components';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MenuModule } from 'primeng/menu';
import { SharedService } from '../../../@core/services/shared.service';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { ExportFileComponent } from '../../../@core/export-file/export-file.component';
import { TransactionManualCompleteComponent } from '../transaction-manual-complete/transaction-manual-complete.component';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    InfoCardComponent,
    InfoPanelComponent,
    LoaderComponent,
    NgIf,
    NgFor,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    FormsModule,
    DataTableComponent,
    InputTextModule,
    CalendarModule,
    MenuModule
  ]
})
export class TransactionListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnChanges, OnDestroy {
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() showActionbarTitle: boolean;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showActionbarButton: boolean;
  @Input() isPaginated: boolean = true;
  @Input() hubPlatformId: string;
  @Input() chargePointId: string = null;
  @Input() sessionId: string = null;
  @Input() userId: string;

  private destroy$: Subject<void> = new Subject<void>();
  calendarSubscription: Subscription;
  @ViewChild('calendar') datePicker;

  infoPanelTitle = this.getTranslate('PAGES.TRANSACTIONS.TRANSACTION-YET');
  infoPanelDescription = this.getTranslate(
    'PAGES.TRANSACTIONS.TRANSACTION-YET-DESCRIPTION'
  );
  infoPanelImageUrl: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.InfoPanelIllustration.name, '')
  );

  searchIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SearchIcon.name, 'regular')
  );
  filterIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.FilterIcon.name, 'regular')
  );
  dotMenuIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.DotMenuIcon.name, 'regular')
  );
  infoIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.InfoIcon.name, 'medium black')
  );
  receiptIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ReceiptIcon.name, 'medium dark-gray')
  );
  miniCubeSvg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.MiniCubeSvg.name, '')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue  filled-path',
      true
    )
  );
  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small black')
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noTransactionIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoTransactionIcon.name,
      'gigantic dark-blue',
      true
    )
  );
  noTransactionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoTransactionIcon.name,
      'xxlarge dark-blue',
      true
    )
  );

  transactionsResponse: RoamingTransactionDto[];
  selectedTransaction: RoamingTransactionDto;
  statusTypes = TransactionStatus;
  retryPaymentRequest = <RetryRoamingTransactionCommand>{};

  roundPipe = new RoundPipe();

  constructor(
    protected sharedService: SharedService,
    protected transactionService: RoamingTransactionsService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer,
    protected formBuilder: UntypedFormBuilder
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.myForm = this.formBuilder.group({
      rangeDate: [
        [
          moment()
            .subtract(1, 'months')
            .startOf('day')
            .toDate(),
          moment()
            .endOf('day')
            .toDate()
        ],
        Validators.required
      ]
    });

    this.components = {
      exportFile: ExportFileComponent,
      completeManually: TransactionManualCompleteComponent,
      confirmationDialog: ConfirmationDialogComponent
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userId && changes.userId.currentValue) {
      this.getTransactions(this.page, this.pageSize);
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy.bind(this);

    if (this.isChild === undefined) {
      this.getTransactions(this.page, this.pageSize);
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getTransactions(this.page, this.pageSize);
        }
      })
    );

    this.subscription.add(
      (this.calendarSubscription = this.myForm
        .get('rangeDate')
        .valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(date => {
          if (date) {
            if (date[0] && date[1]) {
              this.myForm.patchValue(
                {
                  rangeDate: date
                },
                { emitEvent: false }
              );
              this.closeCalendar();
              this.getTransactions(this.page, this.pageSize);
            }
          }
        }))
    );
  }

  getTransactions(page: number, size: number) {
    this.loading = true;

    this.subscription.add(
      this.transactionService
        .transactionsGet(
          page,
          size,
          this.searchItem.value,
          this.hubPlatformId,
          this.chargePointId,
          this.sessionId,
          this.userId,
          this.myForm.get('rangeDate').value
            ? moment(this.myForm.get('rangeDate')?.value[0])
                ?.startOf('day')
                .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            : null,
          this.myForm.get('rangeDate').value
            ? moment(this.myForm.get('rangeDate')?.value[1])
                ?.endOf('day')
                .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            : null
        )
        .subscribe({
          next: v => {
            this.transactionsResponse = [];
            this.transactionsResponse = v.items;
            this.totalItemCount = v.totalCount;
            this.tableConfig.totalItemCount = v.totalCount;

            this.checkSearchActive(
              this.searchItem.value,
              null,
              this.selectedFilters
            );
            this.generateDataTable();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {}
        })
    );
  }

  loadLazy(e: LazyLoadEvent) {
    this.sort_by = e.sortField ? e.sortField : 'created';
    // this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getTransactions(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'readableId',
        header: this.getTranslate('PAGES.TRANSACTIONS.TRANSACTION-ID'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: 'readableId'
        },
        templateConfig: {
          routePath: '/transactions/{{id}}',
          showAvatar: true,
          svgElement: this.receiptIcon
        }
      },
      {
        field: 'created',
        header: this.getTranslate('PAGES.TRANSACTIONS.DATE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{created}}',
          subtitleFirst: '{{created}}'
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['created']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['created']
            }
          ]
        }
      },
      {
        field: 'chargePointName',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: !this.chargePointId ? true : false,
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          routePath: '/charge-points/{{chargePointInterestId}}'
        },
        templateInputs: {
          title: '{{ chargePointName }}'
        }
      },
      {
        field: 'userId',
        header: this.getTranslate('PAGES.TRANSACTIONS.USER'),
        visible: !this.userId ? true : false,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{userId}}',
          subtitleFirst: (item: RoamingTransactionDto) => item.plateNo || '-'
        }
      },
      {
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.DURATION'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item =>
            this.dateDifference(
              item?.chargeSessionData?.startMeterTime,
              item?.chargeSessionData?.stopMeterTime
            ) || '-'
        }
      },
      {
        field: 'totalKWH',
        header: this.getTranslate('PAGES.TRANSACTIONS.USAGE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: RoamingTransactionDto) =>
            `${this.roundPipe.transform(item?.totalKWH, 3)}${this.getTranslate(
              'PAGES.SESSIONS.KWH'
            )}`
        },
        templatePipes: {}
      },
      {
        field: '',
        header: this.getTranslate('PAGES.TRANSACTIONS.DISCOUNT-AMOUNT'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => `${item?.currency?.symbol}${item?.discountAmount}`
        },
        templatePipes: {
          title: [
            {
              name: DecimalPipe,
              args: ['1.2-2'],
              inputFields: ['discountAmount']
            }
          ]
        }
      },
      {
        field: 'totalAmount',
        header: this.getTranslate('PAGES.TRANSACTIONS.AMOUNT'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => `${item?.currency?.symbol}${item?.totalAmount}`
        },
        templatePipes: {
          title: [
            {
              name: DecimalPipe,
              args: ['1.2-2'],
              inputFields: ['totalAmount']
            }
          ]
        }
      },
      {
        field: 'status',
        header: this.getTranslate('PAGES.TRANSACTIONS.STATUS'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          tagValue: item =>
            this.getEnumTypeTranslation(TransactionStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          showTag: true,
          backgroundedTag: true
        }
      },
      {
        field: 'invoiceId',
        header: this.getTranslate('PAGES.INVOICES.STATUS'),
        visible: true,
        templateComponent: DynamicElementComponent,
        templateInputs: {
          itemValue: item =>
            item.status === this.statusTypes.Success && item.invoiceId
              ? true
              : false
        },
        templateConfig: {
          elementType: ElementType.Checkbox,
          binaryValue: true,
          disabledValue: true
        }
      },
      {
        field: null,
        header: null,
        visible: true,
        templateComponent: DynamicMenuComponent,
        templateConfig: {
          dynamicMenuItems: item => {
            return this.generateMenuItems(item);
          }
        }
      }
    ];

    this.loading = false;
  }

  generateMenuItems(item: RoamingTransactionDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate('COMMON.VIEW-DETAILS'),
      routerLink: ['/transactions', item?.id]
    });

    menuItems.push({
      label: this.getTranslate('PAGES.TRANSACTIONS.RETRY-PAYMENT'),
      disabled:
        item.status !== TransactionStatus.Failed ||
        item.status !== TransactionStatus.Pending,
      command: () => {
        this.retryPaymentConfirmation(item);
      }
    });

    menuItems.push({
      label: this.getTranslate('PAGES.TRANSACTIONS.COMPLETE-MANUALLY'),
      disabled:
        item.status !== TransactionStatus.Failed ||
        item.status !== TransactionStatus.Pending,
      command: () => {
        this.completeManuallyConfirmation(item);
      }
    });

    menuItems.push({
      label: this.getTranslate('PAGES.INVOICES.RETRY-CREATE-INVOICE'),
      disabled: item.status !== TransactionStatus.Success && !item?.invoiceId,
      command: () => {
        this.retryCreateInvoice(item);
      }
    });

    return menuItems;
  }

  generateFilterMenuItems(): any {
    return (this.menuItems = [
      {
        items: [
          {
            label: this.getTranslate('COMMON.ALL'),
            icon: Object.keys(this.filter).length === 0 ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.getTransactions(this.page, this.pageSize);
              this.selectedFilters = [];
            }
          }
        ]
      },
      { separator: true },
      {
        label: this.getTranslate('PAGES.INVOICES.STATUS'),
        items: [
          {
            label: this.getTranslate('COMMON.CREATED'),
            icon: this.filter.IsInvoiceCreated === true ? 'filter-icon' : null,
            command: () => {
              this.filter.IsInvoiceCreated = true;
              this.addFilter({
                label: 'IsInvoiceCreated',
                value: this.getTranslate('COMMON.CREATED')
              });
              this.getTransactions(this.page, this.pageSize);
            }
          },
          {
            label: this.getTranslate('COMMON.NOT-CREATED'),
            icon: this.filter.IsInvoiceCreated === false ? 'filter-icon' : null,
            command: () => {
              this.filter.IsInvoiceCreated = false;
              this.addFilter({
                label: 'IsInvoiceCreated',
                value: this.getTranslate('COMMON.NOT-CREATED')
              });
              this.getTransactions(this.page, this.pageSize);
            }
          }
        ]
      },
      {
        label: this.getTranslate('PAGES.TRANSACTIONS.STATUS'),
        items: [
          ...Object.values(this.statusTypes)
            .sort()
            .filter(status => status !== TransactionStatus.Undefined)
            .map(status => {
              return {
                label: this.getEnumTypeTranslation(TransactionStatus, status),
                icon: this.filter.status === status ? 'filter-icon' : null,
                command: () => {
                  this.filter.status = status;
                  this.addFilter({
                    label: 'status',
                    value: this.getEnumTypeTranslation(
                      TransactionStatus,
                      status
                    )
                  });
                  this.getTransactions(this.page, this.pageSize);
                }
              };
            })
        ]
      }
    ]);
  }

  addFilter(filter: { label: string; value: any }) {
    const existingSelectedFilterIndex = this.selectedFilters.findIndex(
      f => f.label.toUpperCase() === filter.label.toUpperCase()
    );

    if (existingSelectedFilterIndex !== -1) {
      if (
        this.selectedFilters[
          existingSelectedFilterIndex
        ].value.toUpperCase() === filter.value.toUpperCase()
      ) {
        this.selectedFilters.splice(existingSelectedFilterIndex, 1);
        delete this.filter[filter.label];
      } else {
        this.selectedFilters[existingSelectedFilterIndex].value = filter.value;
      }
    } else {
      this.selectedFilters.push(filter);
    }
  }

  resetFilter(): void {
    this.loading = true;
    this.filter = {};
    this.selectedFilters = [];
    this.searchItem.setValue(null);
  }

  closeCalendar() {
    this.datePicker.overlayVisible = false;
  }

  retryPaymentConfirmation(item: RoamingTransactionDto) {
    this.dialogConfig.data = {
      description: this.getTranslate(
        'PAGES.TRANSACTIONS.RETRY-PAYMENT-DESCRIPTION'
      ),
      buttonText: this.getTranslate('PAGES.TRANSACTIONS.RETRY-PAYMENT'),
      confirmEventCallback: (eventData: any) => {
        this.retryPayment(item);
      }
    };

    this.open(this.components.confirmationDialog);
  }

  retryPayment(transaction: RoamingTransactionDto) {
    this.loading = true;
    this.retryPaymentRequest.transactionId = transaction.id;
    this.subscription.add(
      this.transactionService
        .transactionsIdRetryPaymentPost(
          transaction.id,
          this.retryPaymentRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.TRANSACTIONS.RETRY-PAYMENT-SUCCESS')
            );
            this.getTransactions(this.page, this.pageSize);
            this.close();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
            this.close();
          },
          complete: () => {
            this.loading = false;
            this.close();
          }
        })
    );
  }

  completeManuallyConfirmation(transaction: RoamingTransactionDto) {
    this.dialogConfig.data = {
      isChild: true,
      transactionId: transaction.id,
      confirmEventCallback: () => {
        this.getTransactions(this.page, this.pageSize);
        this.close();
      },
      cancelEventCallback: () => {
        this.close();
      }
    };

    this.open(this.components.completeManually);
  }

  retryCreateInvoice(transaction: RoamingTransactionDto) {
    // this.loading = true;
    // let retryCommand: RetryCreateInvoiceCommand = {
    //   transactionId: transaction?.id
    // };
    // this.subscription.add(
    //   this.transactionService
    //     .transactionsIdRetryCreateInvoicePost(
    //       transaction?.id,
    //       this.xApplicationClientId,
    //       retryCommand
    //     )
    //     .subscribe({
    //       next: v => {
    //         this.notificationService.showSuccessToast(
    //           this.getTranslate('PAGES.INVOICES.RETRY-CREATE-INVOICE-SUCCESS')
    //         );
    //         this.getTransactions(this.page, this.pageSize);
    //       },
    //       error: e => {
    //         this.notificationService.showErrorToast(this.handleError(e));
    //         this.loading = false;
    //       },
    //       complete: () => {}
    //     })
    // );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
