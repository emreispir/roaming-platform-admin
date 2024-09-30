import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LazyLoadEvent } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import {
  CardDto,
  CardsService,
  OrderBy,
  UpdateCardCommand
} from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { DeleteConfirmationComponent } from '../../../@core/components/delete-confirmation/delete-confirmation.component';
import { timer } from 'rxjs';
import { ClipboardModule } from 'ngx-clipboard';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { DialogModule } from 'primeng/dialog';
import {
  DynamicElementComponent,
  DataTableComponent,
  CardWithAvatarComponent,
  ElementType,
  ButtonStyle,
  ButtonColor
} from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgClass,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    MenuModule,
    HeaderPanelComponent,
    LoaderComponent,
    InfoPanelComponent,
    InfoCardComponent,
    ClipboardModule,
    DialogModule,
    DataTableComponent,
    DynamicElementComponent
  ],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnChanges, OnDestroy {
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() showActionbarTitle: boolean;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showActionbarButton: boolean;
  @Input() isPaginated: boolean = true;
  @Input() directoryId: string = null;
  @Input() workspaceId: string = null;
  @Input() chargePointId: string = null;
  @Input() userId: string = null;

  infoPanelTitle = this.getTranslate('PAGES.RFIDS.CARD-YET');
  infoPanelDescription = this.getTranslate('PAGES.RFIDS.CARD-YET-DESCRIPTION');

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
  rfidIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RfidIcon.name, 'regular black')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );
  plusIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'regular')
  );
  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small black')
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noRfidIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoRfidIcon.name, 'gigantic none', true)
  );
  noRfidIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoRfidIcon.name, 'xxlarge none', true)
  );
  deleteConfirmationIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoRfidIcon.name,
      'xxxlarge white filled-path',
      true
    )
  );

  rfidCardsResponse: CardDto[];
  selectedRfidCard: CardDto;
  updateCardRequest = <UpdateCardCommand>{};

  constructor(
    protected cardsService: CardsService,
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.workspaceId && changes.workspaceId.currentValue) ||
      (changes.chargePointId && changes.chargePointId.currentValue) ||
      (changes.userId && changes.userId.currentValue)
    ) {
      this.getCardsWithQuery();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isChild) {
      this.breadcrumbMenuItems = [
        { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
        {
          label: this.getDecodedUserToken()?.extension_Directory?.name,
          routerLink: '/dashboard'
        },
        {
          label: this.getTranslate('PAGES.RFIDS.TITLE'),
          routerLink: '/cards'
        }
      ];

      this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    }
    super.ngAfterViewInit();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  init() {
    this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
      ? this.getDecodedUserToken()?.extension_DirectoryId
      : null;

    this.components = {
      cardDelete: DeleteConfirmationComponent,
      confirmationDialog: ConfirmationDialogComponent
    };
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy?.bind(this);

    if (this.isChild === undefined) {
      this.getCardsWithQuery();
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getCards(this.page, this.pageSize);
        }
      })
    );
  }

  getCardsWithQuery(): void {
    this.subscription.add(
      this.activatedRoute.queryParamMap.subscribe(queryParams => {
        this.filter.status = queryParams.get('status');
        this.getCards(this.page, this.pageSize);
      })
    );
  }

  getCards(page: number, size: number) {
    this.loading = true;

    this.subscription.add(
      this.cardsService
        .cardsGet(
          page,
          size,
          this.searchItem.value,
          null,
          this.userId,
          this.filter?.isActive,
          this.filter?.isBlocked,
          this.directoryId,
          this.workspaceId
        )
        .subscribe({
          next: v => {
            this.rfidCardsResponse = [];
            this.rfidCardsResponse = v.items;
            this.totalItemCount = v.totalCount;
            this.tableConfig.totalItemCount = v.totalCount;

            this.checkSearchActive(this.searchItem.value, this.selectedFilter);
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
    this.sort_by = e.sortField ? e.sortField : 'cardHolderName';
    this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getCards(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  showIdentifier(card: CardDto) {
    this.showDialog = true;
    this.selectedRfidCard = card;
  }

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'userId',
        header: this.getTranslate('PAGES.RFIDS.CARD-HOLDER-NAME'),
        visible: true,
        bodyColumnClass: 'text-capitalize',
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          routePath: '/users/{{userId}}',
          showAvatar: true,
          svgElement: this.rfidIcon
        },
        templateInputs: {
          title: 'cardHolderName'
        }
      },
      {
        field: 'expiryDate',
        header: this.getTranslate('PAGES.RFIDS.EXPIRATION-DATE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: 'expiryDate',
          subtitleFirst: 'expiryDate'
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['expiryDate']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['expiryDate']
            }
          ]
        }
      },
      {
        field: 'identifier',
        header: this.getTranslate('PAGES.RFIDS.TAG'),
        visible: true,
        templateComponent: DynamicElementComponent,
        outputEvents: {
          buttonTriggered: item => this.showIdentifier(item)
        },
        templateConfig: {
          elementType: ElementType.Button,
          buttonType: ButtonStyle.Circle,
          buttonColor: ButtonColor.Transparent,
          buttonIconClass: 'fa fa-eye'
        }
      },
      {
        field: 'isActive',
        header: this.getTranslate('PAGES.RFIDS.IS-ACTIVE'),
        visible: true,
        templateComponent: DynamicElementComponent,
        templateInputs: {
          itemValue: 'isActive'
        },
        templateConfig: {
          elementType: ElementType.Checkbox,
          binaryValue: true,
          disabledValue: true
        }
      },
      {
        field: 'isBlocked',
        header: this.getTranslate('PAGES.RFIDS.IS-BLOCKED'),
        visible: true,
        templateComponent: DynamicElementComponent,
        templateInputs: {
          itemValue: 'isBlocked'
        },
        templateConfig: {
          elementType: ElementType.Checkbox,
          binaryValue: true,
          disabledValue: true
        }
      }
    ];

    this.loading = false;
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
              this.getCards(this.page, this.pageSize);
              this.selectedFilter = null;
            }
          }
        ]
      },
      { separator: true },
      {
        label: this.getTranslate('PAGES.RFIDS.IS-ACTIVE'),
        items: [
          {
            label: this.getTranslate('COMMON.ACTIVE'),
            icon: this.filter.isActive === true ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isActive = true;
              this.getCards(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('COMMON.ACTIVE');
            }
          },
          {
            label: this.getTranslate('COMMON.PASSIVE'),
            icon: this.filter.isActive === false ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isActive = false;
              this.getCards(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('COMMON.PASSIVE');
            }
          }
        ]
      },
      {
        label: this.getTranslate('PAGES.RFIDS.IS-BLOCKED'),
        items: [
          {
            label: this.getTranslate('COMMON.YES'),
            icon: this.filter.isBlocked === true ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isBlocked = true;
              this.getCards(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('COMMON.YES');
            }
          },
          {
            label: this.getTranslate('COMMON.NO'),
            icon: this.filter.isBlocked === false ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isBlocked = false;
              this.getCards(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('PAGES.CARDS.NO');
            }
          }
        ]
      }
    ]);
  }

  resetFilter(): void {
    this.loading = true;
    this.filter = {};
    this.selectedFilter = null;
    this.searchItem.setValue(null);
  }

  feedbackButtons = new Set<string>();

  onClickButton(identifier: string) {
    this.feedbackButtons.add(identifier);
    timer(1000).subscribe(() => {
      this.feedbackButtons.delete(identifier);
    });
  }

  isFeedbackVisible(identifier: string): boolean {
    return this.feedbackButtons.has(identifier);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
