import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { ChargeSessionsService } from '../../../../../api/api/chargeSessions.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import {
  CancelChargeSessionCommand,
  ChargePointDto,
  ChargePointStatus,
  ChargePointsService,
  ChargeSessionDto,
  ChargeSessionStatus,
  ConnectorDto,
  ConnectorStatus,
  ConnectorType,
  OrderBy,
  RemoteStopTransactionCommand,
  ResetCommand,
  UnlockConnectorCommand
} from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { Policy } from '../../../@core/models/policy';
import { ExportFileComponent } from '../../../@core/export-file/export-file.component';
import * as moment from 'moment';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import { RoundPipe } from '../../../@theme/pipes';
import {
  CardWithAvatarComponent,
  DataTableComponent,
  DynamicMenuComponent
} from 'surge-components';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { ConnectorActionType } from '../../../@core/models/common';

@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    InfoCardComponent,
    LoaderComponent,
    InfoPanelComponent,
    NgIf,
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
export class SessionListComponent extends ScrollableComponent
  implements AfterViewInit, AfterViewChecked, OnInit, OnChanges {
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
  @Input() userId: string;

  private destroy$: Subject<void> = new Subject<void>();
  calendarSubscription: Subscription;
  @ViewChild('calendar') datePicker;

  infoPanelTitle = this.getTranslate('PAGES.SESSIONS.SESSION-YET');
  infoPanelDescription = this.getTranslate(
    'PAGES.SESSIONS.SESSION-YET-DESCRIPTION'
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
  sessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SessionIcon.name, 'medium dark-gray')
  );
  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small medium-gray filled-path',
      true
    )
  );
  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small black')
  );

  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );
  noSessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoSessionIcon.name, 'xxlarge none', true)
  );
  noSessionIconGiga: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoSessionIcon.name, 'gigantic none', true)
  );

  chargePointStatusTypes = ChargePointStatus;
  sessionsResponse: ChargeSessionDto[];
  statusTypes = ChargeSessionStatus;
  connectorStatusTypes = ConnectorStatus;
  connectorTypes = ConnectorType;
  stopChargeRequest: RemoteStopTransactionCommand = {};
  cancelSessionCommand: CancelChargeSessionCommand = {};

  unlockConnectorRequest = <UnlockConnectorCommand>{};

  roundPipe = new RoundPipe();

  constructor(
    protected chargeSessionsService: ChargeSessionsService,
    protected chargePointService: ChargePointsService,
    protected sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    private cd: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer,
    protected formBuilder: UntypedFormBuilder
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
      this.getSessionsWithQuery();
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
          label: this.getTranslate('PAGES.SESSIONS.TITLE'),
          routerLink: '/sessions'
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
      confirmationDialog: ConfirmationDialogComponent,
      exportFile: ExportFileComponent
    };
  }

  ngOnInit(): void {
    this.tableConfig.loadLazy = this.loadLazy?.bind(this);
    if (this.isChild === undefined) {
      this.getSessionsWithQuery();
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        if (
          this.searchItem?.value?.length >= 3 ||
          this.searchItem?.value?.length === 0 ||
          this.searchItem?.value === null
        ) {
          this.getSessions(this.page, this.pageSize);
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
              this.getSessions(this.page, this.pageSize);
            }
          }
        }))
    );
  }

  getSessionsWithQuery(): void {
    this.subscription.add(
      this.activatedRoute.queryParamMap.subscribe(queryParams => {
        this.filter.status = queryParams?.get('status');
        this.selectedFilter = this.filter.status;

        if (this.filter.status) {
          this.selectedFilter = this.getTranslate(
            `ENUM.${this.filter.status.toUpperCase()}`
          );
        }

        this.generateFilterMenuItems();

        this.getSessions(this.page, this.pageSize);
      })
    );
  }

  getSessions(page: number, size: number) {
    this.loading = true;
    this.dateNow = moment();

    this.subscription.add(
      this.chargeSessionsService
        .chargeSessionsGet(
          page,
          size,
          this.searchItem.value,
          this.directoryId,
          this.workspaceId,
          this.chargePointId,
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
            : null,
          this.filter,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.sessionsResponse = [];
            this.sessionsResponse = v.items;
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

  generateDataTable() {
    this.tableColumns = [
      {
        field: '',
        header: this.getTranslate('PAGES.SESSIONS.SESSION-ID'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{readableId}}',
          tagValue: item =>
            this.getEnumTypeTranslation(ChargeSessionStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          // routePath: '/sessions/{{id}}',
          showAvatar: true,
          svgElement: this.sessionIcon,
          showTag: true,
          backgroundedTag: true
        }
      },
      {
        field: 'chargePoint',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: !this.chargePointId ? true : false,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) => item?.chargePoint?.name,
          subtitleFirst: (item: ChargeSessionDto) =>
            item?.chargePoint?.readableId,
          tagValue: item =>
            this.getEnumTypeTranslation(
              ChargePointStatus,
              item.chargePoint.status
            ),
          tagClass: item => item.chargePoint.status?.toLowerCase()
        },
        templateConfig: {
          // routePath: '/charge-points/{{chargePointId}}',
          showTag: item =>
            item.status === this.statusTypes.Charging ? true : false,
          backgroundedTag: true
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.CONNECTORS.CONNECTOR'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item =>
            this.getTranslate('PAGES.CONNECTORS.CONNECTOR-PARAM', {
              param: `${this.getConnector(item)?.connectorNumber}`
            }),
          subtitleFirst: item =>
            `${this.getEnumTypeTranslation(
              this.connectorTypes,
              this.getConnector(item)?.connectorType
            )}`,
          tagValue: item =>
            this.getEnumTypeTranslation(
              ConnectorStatus,
              this.getConnector(item).status
            ),
          tagClass: item => this.getConnector(item).status?.toLowerCase()
        },
        templateConfig: {
          // routePath: '/charge-points/{{chargePointId}}/connectors',
          showTag: item =>
            item.status === this.statusTypes.Charging ? true : false,
          backgroundedTag: true
        }
      },
      // {
      //   field: 'user',
      //   header: this.getTranslate('PAGES.SESSIONS.USER'),
      //   visible: !this.userId ? true : false,
      //   templateComponent: CardWithAvatarComponent,
      //   templateConfig: {
      //     routePath: '/users/{{user.id}}'
      //   },
      //   templateInputs: {
      //     title: '{{user.firstName}} {{user.lastName}}',
      //     subtitleFirst: item => item.plateNo || '-'
      //   }
      // },
      {
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.STARTED'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.chargeSessionData?.startMeterTime || '-',
          subtitleFirst: item => item?.chargeSessionData?.startMeterTime || ''
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['chargeSessionData.startMeterTime']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['chargeSessionData.startMeterTime']
            }
          ]
        }
      },
      {
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.STOPPED'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.chargeSessionData?.stopMeterTime || '-',
          subtitleFirst: item => item?.chargeSessionData?.stopMeterTime || ''
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['chargeSessionData.stopMeterTime']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['chargeSessionData.stopMeterTime']
            }
          ]
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
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.USAGE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) =>
            `${this.roundPipe.transform(
              item?.chargeSessionData?.calculatedKWH,
              3
            )}${this.getTranslate('PAGES.SESSIONS.KWH')}`
        }
      },
      {
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.STATE-OF-CHARGE'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: ChargeSessionDto) => {
            const startCharge = item.chargeSessionData?.stateOfChargeStart;
            const stopCharge = item.chargeSessionData?.stateOfChargeStop;

            const startChargeDisplay =
              startCharge !== null && startCharge !== undefined
                ? `%${startCharge}`
                : 'N/A';
            const stopChargeDisplay =
              stopCharge !== null && stopCharge !== undefined
                ? `%${stopCharge}`
                : 'N/A';

            return `${startChargeDisplay}\n\n → \n\n ${stopChargeDisplay}`;
          }
        }
      },
      {
        field: 'chargeSessionData',
        header: this.getTranslate('PAGES.SESSIONS.START-IDLE-TIME'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item.chargeSessionData?.startIdleTime || 'N/A'
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['HH:mm:ss', this.sharedService.language],
              inputFields: ['chargeSessionData.startIdleTime']
            }
          ]
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
    this.sort_by = e.sortField ? e.sortField : 'startDate';
    this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getSessions(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  generateMenuItems(item: ChargeSessionDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    // menuItems.push({
    //   label: this.getTranslate('COMMON.VIEW-DETAILS'),
    //   routerLink: ['/sessions', item?.id]
    // });

    if (this.isUserValidForPolicies([Policy.ChargePointRemoteStop])) {
      menuItems.push({
        label: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
        disabled:
          item?.status !== ChargeSessionStatus.Charging ||
          item?.status !== ChargeSessionStatus.Accepted,
        command: () => this.cancelChargeConfirmation(item)
      });
    }
    if (this.isUserValidForPolicies([Policy.ChargePointRemoteStop])) {
      menuItems.push({
        label: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
        disabled:
          item?.status !== ChargeSessionStatus.Charging ||
          item?.status !== ChargeSessionStatus.Accepted,
        command: () => {
          this.stopChargeRequest.chargePointId = item?.chargePointId;
          this.stopChargeRequest.connectorId = item?.connectorId;
          this.stopChargeConfirmation(item);
        }
      });
    }

    let sessionConnector: ConnectorDto = this.getConnector(item);

    menuItems.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.UNLOCK_CONNECTOR.toUpperCase()}`
      ),
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointUnlock]) ||
        sessionConnector.status === ConnectorStatus.Available ||
        sessionConnector.status === ConnectorStatus.Faulted ||
        sessionConnector.status === ConnectorStatus.Reserved ||
        sessionConnector.status === ConnectorStatus.Undefined ||
        sessionConnector.status === ConnectorStatus.Unavailable,
      command: () => {
        this.unlockConnectorRequest.chargePointId =
          sessionConnector?.chargePointId;
        this.unlockConnectorRequest.connectorNumber =
          sessionConnector?.connectorNumber;
        this.unlockConnectorRequest.connectorId = sessionConnector?.id;
        this.unlockConnectorConfirmation(sessionConnector);
      }
    });

    if (this.isUserValidForPolicies([Policy.ChargePointReset])) {
      menuItems.push({
        label: this.getTranslate('PAGES.CHARGE-POINTS.REBOOT'),
        disabled: !item?.chargePoint?.isPaired,
        command: () => this.resetChargePointConfirmation(item?.chargePoint)
      });
    }

    return menuItems;
  }

  generateFilterMenuItems(): any {
    return (this.filterMenuItems = [
      {
        label: this.getTranslate('COMMON.ALL'),
        icon: this.filter.status === null ? 'filter-icon' : null,
        command: () => {
          this.filter.status = {};
          this.getSessions(this.page, this.pageSize);
          this.selectedFilter = null;
        }
      },
      { separator: true },
      ...Object.values(this.statusTypes)
        .sort()
        .filter(status => status !== 'Undefined')
        .map(status => {
          return {
            label: this.getEnumTypeTranslation(ChargeSessionStatus, status),
            icon: this.filter.status === status ? 'filter-icon' : null,
            command: () => {
              this.filter.status = status;
              this.getSessions(this.page, this.pageSize);
              this.selectedFilter = this.getEnumTypeTranslation(
                ChargeSessionStatus,
                status
              );
            }
          };
        })
    ]);
  }

  resetFilter(): void {
    this.loading = true;
    this.filter = {};
    this.selectedFilter = null;
    this.searchItem.setValue(null);
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  ngOnDestory() {
    this.subscription.unsubscribe();
  }

  cancelChargeConfirmation(item: ChargeSessionDto) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.CANCEL-CHARGE-DESCRIPTION',
        {
          connectorNumber: item?.connectorNumber
        }
      ),
      confirmWithDescription: true,
      confirmDescriptionTitle: this.getTranslate(
        'PAGES.CHARGE-POINTS.CANCEL-CHARGE-REASON'
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
      confirmEventCallback: message => {
        this.cancelSessionCommand.id = item?.id;
        this.cancelSessionCommand.stopReason = message?.description;

        this.cancelCharge(item);
      }
    };
    this.open(this.components.confirmationDialog);
  }

  cancelCharge(item: ChargeSessionDto) {
    this.buttonLoading = true;
    this.chargeSessionsService
      .chargeSessionsIdCancelPost(
        item?.id,
        this.xApplicationClientId,
        this.cancelSessionCommand
      )
      .subscribe({
        next: v => {
          this.notificationService.showSuccessToast(
            this.getTranslate('PAGES.CHARGE-POINTS.CANCELLING-CHARGE')
          );
          this.close();
          this.buttonLoading = false;
        },
        error: e => {
          this.notificationService.showErrorToast(this.handleError(e));
          this.close();
          this.buttonLoading = false;
        },
        complete: () => {
          this.getSessions(this.page, this.pageSize);
        }
      });
  }

  getConnector(chargeSession: ChargeSessionDto): ConnectorDto {
    let connector: any = chargeSession.chargePoint?.connectors?.find(
      c => c.id == chargeSession.connectorId
    );
    return connector as ConnectorDto;
  }

  stopChargeConfirmation(item: ChargeSessionDto) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.STOP-CHARGE-DESCRIPTION',
        {
          connectorNumber: item?.connectorNumber
        }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      confirmEventCallback: (eventData: any) => {
        this.stopCharge(item);
      },
      cancelEventCallback: (eventData: any) => {}
    };
    this.open(this.components.confirmationDialog);
  }

  stopCharge(item: ChargeSessionDto) {
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdStopPost(
          item?.chargePointId,
          this.xApplicationClientId,
          this.stopChargeRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.CHARGE-POINTS.STOPPING-CHARGE')
            );
            this.buttonLoading = false;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.close();

            this.buttonLoading = false;
          },
          complete: () => {
            this.close();
            this.getSessions(this.page, this.pageSize);
          }
        })
    );
  }

  unlockConnectorConfirmation(connector: any) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.UNLOCK-CONNECTOR'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.UNLOCK-CONNECTOR-DESCRIPTION',
        {
          connectorNumber: connector?.connectorNumber
        }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.UNLOCK-CONNECTOR'),
      confirmEventCallback: (eventData: any) => {
        this.unlockConnector(connector);
      },
      cancelEventCallback: (eventData: any) => {}
    };
    this.open(this.components.confirmationDialog);
  }

  unlockConnector(connector: any) {
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdUnlockPost(
          connector?.chargePointId,
          this.xApplicationClientId,
          this.unlockConnectorRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.CHARGE-POINTS.UNLOCKED-CONNECTOR')
            );
            this.buttonLoading = false;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.close();
            this.buttonLoading = false;
          },
          complete: () => {
            this.close();
            this.getSessions(this.page, this.pageSize);
          }
        })
    );
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
            this.getSessions(this.page, this.pageSize);
          }
        })
    );
  }

  closeCalendar() {
    this.datePicker.overlayVisible = false;
  }
}
