import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { HelperService } from '../../../@core/services/helper.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import {
  ChargePointAccessibility,
  ChargePointDto,
  ChargePointStatus,
  ChargingMode,
  OrderBy,
  SubscriptionDto
} from '../../../../../api/model/models';
import {
  ChargePointsService,
  DirectoriesService,
  ResetCommand
} from '../../../../../api';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { timer } from 'rxjs';
import { Policy } from '../../../@core/models/policy';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { DatePipe, NgClass, NgIf } from '@angular/common';
import {
  CardWithAvatarComponent,
  DynamicElementComponent,
  ElementType,
  ButtonStyle,
  ButtonColor,
  DynamicMenuComponent,
  DataTableComponent
} from 'surge-components';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { ClipboardModule } from 'ngx-clipboard';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ChargePointConnectorStartComponent } from '../charge-point-connector-start/charge-point-connector-start.component';

@Component({
  selector: 'app-charge-point-list',
  templateUrl: './charge-point-list.component.html',
  styleUrls: ['./charge-point-list.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    HeaderPanelComponent,
    LoaderComponent,
    InfoPanelComponent,
    InfoCardComponent,
    ClipboardModule,
    InputTextModule,
    MenuModule,
    DialogModule,
    DataTableComponent,
    NgIf,
    NgClass
  ]
})
export class ChargePointListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnChanges, OnDestroy {
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() showActionbarTitle: boolean;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showActionbarButton: boolean;
  @Input() isPaginated: boolean = true;
  @Input() workspaceId: string = null;
  @Input() directoryId: string = null;
  @Input() workspaceChargePointsCount: any;
  @Input() workspaceDirectorySubscriptionPlan: SubscriptionDto = null;
  @Input() configNumber: number;

  @Output() secondaryButtonClicked: EventEmitter<void> = new EventEmitter<
    void
  >();

  infoPanelTitle = this.getTranslate(
    'PAGES.CHARGE-POINTS.CREATE-FIRST-CHARGE-POINT-LIST'
  );
  infoPanelDescription = this.getTranslate(
    'PAGES.CHARGE-POINTS.CREATE-FIRST-CHARGE-POINT-LIST-DESCRIPTION'
  );

  settingIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular')
  );
  settingIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SettingIcon.name, 'regular black')
  );
  plusIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'regular')
  );
  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small black')
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
  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noChargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'xxlarge none',
      true
    )
  );
  noChargePointIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.NoChargePointIcon.name,
      'gigantic none',
      true
    )
  );

  chargePointsResponse: ChargePointDto[];
  statusTypes = ChargePointStatus;
  chargePointAccess = ChargePointAccessibility;

  totalPassiveCpCount: number;
  totalNotPairedCpCount: number;
  selectedChargePoint: ChargePointDto;

  constructor(
    protected directoryService: DirectoriesService,
    protected chargePointService: ChargePointsService,
    protected sharedService: SharedService,
    protected helperService: HelperService,
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
    if (changes.workspaceId && changes.workspaceId.currentValue) {
      this.getChargePoints(this.page, this.pageSize);
    }
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
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
          label: this.getTranslate('PAGES.CHARGE-POINTS.TITLE'),
          routerLink: '/charge-points'
        }
      ];

      this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    }
    super.ngAfterViewInit();
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy?.bind(this);

    if (this.isChild === undefined) {
      this.getChargePoints(this.page, this.pageSize);
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getChargePoints(this.page, this.pageSize);
        }
      })
    );
  }

  init() {
    if (this.workspaceId) {
      this.directoryId = this.directoryId;
    } else {
      this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
        ? this.getDecodedUserToken()?.extension_DirectoryId
        : null;
    }

    this.components = {
      confirmationDialog: ConfirmationDialogComponent,
      connectorStart: ChargePointConnectorStartComponent
    };
  }

  showIdentifier(chargePoint: ChargePointDto) {
    this.showDialog = true;
    this.selectedChargePoint = chargePoint;
  }

  getChargePoints(page: number, size: number) {
    this.loading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsGet(
          page,
          size,
          this.searchItem.value,
          null,
          this.directoryId,
          this.workspaceId,
          this.filter
        )
        .subscribe({
          next: v => {
            this.chargePointsResponse = [];
            this.chargePointsResponse = v.items;
            this.totalItemCount = v.totalCount;
            this.tableConfig.totalItemCount = v.totalCount;

            this.totalPassiveCpCount = this.chargePointsResponse.filter(
              item => item.isActive === false
            ).length;
            this.totalNotPairedCpCount = this.chargePointsResponse.filter(
              item => item.isPaired === false
            ).length;
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

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'name',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: 'name',
          subtitleFirst: 'readableId'
        },
        templateConfig: {
          routePath: '/charge-points/{{id}}',
          showAvatar: true,
          svgElement: this.chargePointIcon
        }
      },
      // {
      //   field: 'workspaceName',
      //   header: this.getTranslate('PAGES.WORKSPACES.WORKSPACE'),
      //   visible: !this.workspaceId ? true : false,
      //   templateComponent: CardWithAvatarComponent,
      //   templateInputs: {
      //     title: 'workspaceName',
      //     imageUrl: 'imageUrl',
      //     subtitleFirst: 'readableId'
      //   },
      //   templateConfig: {
      //     routePath: '/workspaces/{{workspaceId}}'
      //   }
      // },
      {
        field: 'status',
        header: this.getTranslate('COMMON.STATUS'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          tagValue: item =>
            this.getEnumTypeTranslation(ChargePointStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          showTag: true,
          backgroundedTag: true
        }
      },
      {
        field: 'lastHeartBeatTime',
        header: this.getTranslate('PAGES.CHARGE-POINTS.LAST-HEART-BEAT-TIME'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.lastHeartBeatTime || '-',
          subtitleFirst: item => item?.lastHeartBeatTime || ''
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['lastHeartBeatTime']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['lastHeartBeatTime']
            }
          ]
        },
        templateConfig: {
          showAvatar: false
        }
      },
      {
        field: 'chargingLevel',
        header: this.getTranslate('PAGES.CONNECTORS.POWER'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: `{{ chargingLevel }} - {{ maxOutputKw }}${this.getTranslate(
            'PAGES.CHARGE-POINTS.KWH'
          )}`,
          subtitleFirst: `{{ chargingPowerType }} - {{ chargePointProtocol }}`,
          subtitleSecond: (item, utils) =>
            this.getEnumTypeTranslation(ChargingMode, item?.chargingMode)
        }
      },
      {
        field: 'isPaired',
        header: this.getTranslate('PAGES.CHARGE-POINTS.IS-PAIR'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          showTag: true
        },
        conditions: [
          {
            field: 'isPaired',
            value: true,
            input: 'tagValue',
            result: this.getTranslate('PAGES.CHARGE-POINTS.PAIRED'),
            tagClass: 'text-success'
          }
        ]
      },
      {
        field: 'chargePointAccessibility',
        header: this.getTranslate('COMMON.ACCESS'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          tagValue: (item, utils) =>
            this.getEnumTypeTranslation(
              ChargePointAccessibility,
              item.chargePointAccessibility
            ),
          tagClass: item => item.chargePointAccessibility?.toLowerCase()
        },
        templateConfig: {
          showTag: true
        }
      },
      {
        field: 'identifier',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CONNECT-IDENTIFIER'),
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
        },
        conditions: [
          {
            field: 'isPaired',
            value: false,
            input: 'itemVisible',
            result: false
          }
        ]
      },
      {
        field: 'isActive',
        header: this.getTranslate('PAGES.CHARGE-POINTS.IS-ACTIVE'),
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

  loadLazy(e: LazyLoadEvent) {
    this.sort_by = e.sortField ? e.sortField : 'name';
    this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getChargePoints(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
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
              this.getChargePoints(this.page, this.pageSize);
              this.selectedFilter = null;
            }
          }
        ]
      },
      { separator: true },
      {
        label: this.getTranslate('COMMON.STATUS'),
        items: [
          ...Object.values(this.statusTypes)
            .sort()
            .map(status => {
              return {
                label: this.getEnumTypeTranslation(ChargePointStatus, status),
                icon: this.filter.status === status ? 'filter-icon' : null,
                command: () => {
                  this.filter = {};
                  this.filter.status = status;
                  this.getChargePoints(this.page, this.pageSize);
                  this.selectedFilter = this.getEnumTypeTranslation(
                    ChargePointStatus,
                    status
                  );
                }
              };
            })
        ]
      },
      {
        label: this.getTranslate('PAGES.CHARGE-POINTS.IS-ACTIVE'),
        items: [
          {
            label: this.getTranslate('COMMON.ACTIVE'),
            icon: this.filter.isActive === true ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isActive = true;
              this.getChargePoints(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('COMMON.ACTIVE');
            }
          },
          {
            label: this.getTranslate('COMMON.PASSIVE'),
            icon: this.filter.isActive === false ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isActive = false;
              this.getChargePoints(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate('COMMON.PASSIVE');
            }
          }
        ]
      },
      {
        label: this.getTranslate('PAGES.CHARGE-POINTS.IS-PAIR'),
        items: [
          {
            label: this.getTranslate('PAGES.CHARGE-POINTS.PAIRED'),
            icon: this.filter.isPaired === true ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isPaired = true;
              this.getChargePoints(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate(
                'PAGES.CHARGE-POINTS.PAIRED'
              );
            }
          },
          {
            label: this.getTranslate('PAGES.CHARGE-POINTS.NOT-PAIRED'),
            icon: this.filter.isPaired === false ? 'filter-icon' : null,
            command: () => {
              this.filter = {};
              this.filter.isPaired = false;
              this.getChargePoints(this.page, this.pageSize);
              this.selectedFilter = this.getTranslate(
                'PAGES.CHARGE-POINTS.NOT-PAIRED'
              );
            }
          }
        ]
      },
      {
        label: this.getTranslate('COMMON.ACCESS'),
        items: [
          ...Object.values(this.chargePointAccess).map(access => {
            return {
              label: this.getEnumTypeTranslation(
                ChargePointAccessibility,
                access
              ),
              icon: this.filter.accessibility === access ? 'filter-icon' : null,
              command: () => {
                this.filter = {};
                this.filter.accessibility = access;
                this.getChargePoints(this.page, this.pageSize);
                this.selectedFilter = this.getEnumTypeTranslation(
                  ChargePointAccessibility,
                  access
                );
              }
            };
          })
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

  generateMenuItems(item: ChargePointDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate('COMMON.VIEW-DETAILS'),
      routerLink: ['/charge-points', item?.id]
    });

    if (this.isUserValidForPolicies([Policy.ChargePointReset])) {
      menuItems.push({
        label: this.getTranslate('PAGES.CHARGE-POINTS.REBOOT'),
        visible: item.isPaired === true,
        command: () => this.resetChargePointConfirmation(item)
      });
    }

    return menuItems;
  }

  startChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      isChild: true,
      confirmEventCallback: (eventData: any) => {
        this.close();
      },
      cancelEventCallback: (eventData: any) => {
        this.close();
      }
    };

    this.open(this.components.connectorStart);
  }

  secondaryButtonHandler() {
    this.secondaryButtonClicked.emit();
  }

  feedbackButtons = new Set<string>();

  onClickButton(identifier: string) {
    this.feedbackButtons.add(identifier);
    this.subscription.add(
      timer(1000).subscribe(() => {
        this.feedbackButtons.delete(identifier);
      })
    );
  }

  isFeedbackVisible(identifier: string): boolean {
    return this.feedbackButtons.has(identifier);
  }

  resetChargePointConfirmation(item: ChargePointDto) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.RESET-CHARGE-POINT'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.RESET-CHARGE-POINT-DESCRIPTION',
        { name: item?.name }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.RESET-CHARGE-POINT'),
      confirmEventCallback: (eventData: any) => {
        this.resetChargePoint(item);
      }
    };

    this.open(this.components.confirmationDialog);
  }

  resetChargePoint(item: ChargePointDto) {
    this.buttonLoading = true;
    let resetRequest = {
      chargePointId: item?.id
    } as ResetCommand;

    this.subscription.add(
      this.chargePointService
        .chargePointsIdResetPost(
          item?.id,
          this.xApplicationClientId,
          resetRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate(
                'PAGES.CHARGE-POINTS.RESET-CHARGE-POINT-SUCCESS'
              )
            );
            this.buttonLoading = false;
            this.close();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.close();
            this.buttonLoading = false;
          },
          complete: () => {
            this.getChargePoints(this.page, this.pageSize);
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
