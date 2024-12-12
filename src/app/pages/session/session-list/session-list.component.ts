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
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import {
  ChargePointStatus,
  ConnectorStatus,
  ConnectorType,
  RoamingConnectorDto,
  RoamingPointsService,
  RoamingSessionDto,
  RoamingSessionsService,
  RoamingSessionStatus
} from '../../../../../api';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
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
import { DatePipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
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
  @Input() hubPlatformId: string = null;
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
  sessionsResponse: RoamingSessionDto[];
  statusTypes = RoamingSessionStatus;
  connectorStatusTypes = ConnectorStatus;
  connectorTypes = ConnectorType;
  // stopChargeRequest: RemoteStopTransactionCommand = {
  //   chargePointId: null,
  //   chargeSessionId: null,
  //   connectorId: null
  // };
  // cancelSessionCommand: CancelChargeSessionCommand = {
  //   id: null,
  //   stopReason: null
  // };

  // unlockConnectorRequest = <UnlockConnectorCommand>{};

  roundPipe = new RoundPipe();

  constructor(
    protected chargeSessionsService: RoamingSessionsService,
    protected chargePointService: RoamingPointsService,
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
    this.subscription.add(
      this.chargeSessionsService
        .sessionsGet(
          page,
          size,
          this.searchItem.value,
          this.hubPlatformId,
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
            : null
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
            this.getEnumTypeTranslation(RoamingSessionStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        },
        templateConfig: {
          routePath: '/sessions/{{id}}',
          showAvatar: true,
          svgElement: this.sessionIcon,
          showTag: true,
          backgroundedTag: true
        }
      },
      {
        field: 'chargePointInterest',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: !this.chargePointId ? true : false,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: (item: RoamingSessionDto) => item?.chargePointInterest?.name,
          subtitleFirst: (item: RoamingSessionDto) =>
            item?.chargePointInterest?.externalId,
          tagValue: item =>
            this.getEnumTypeTranslation(
              ChargePointStatus,
              item.chargePointInterest.status
            ),
          tagClass: item => item.chargePointInterest.status?.toLowerCase()
        },
        templateConfig: {
          routePath: '/charge-points/{{chargePointInterestId}}',
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
              param: `${this.getConnector(item)?.connectorNo}`
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
          routePath: '/charge-points/{{chargePointInterestId}}/connectors',
          showTag: item =>
            item.status === this.statusTypes.Charging ? true : false,
          backgroundedTag: true
        }
      },
      {
        field: 'userId',
        header: this.getTranslate('PAGES.SESSIONS.USER'),
        visible: !this.userId ? true : false,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: '{{user.userId}}',
          subtitleFirst: item => item.plateNo || '-'
        }
      },
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
          title: (item: RoamingSessionDto) =>
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
          title: (item: RoamingSessionDto) => {
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

  getConnector(chargeSession: RoamingSessionDto): RoamingConnectorDto {
    let connector: any = chargeSession.chargePointInterest?.sockets?.find(
      c => c.id == chargeSession.chargePointInterestSocketId
    );
    return connector as RoamingConnectorDto;
  }

  loadLazy(e: LazyLoadEvent) {
    this.sort_by = e.sortField ? e.sortField : 'startDate';
    // this.order_by = e.sortOrder === 1 ? OrderBy.Asc : OrderBy.Desc;
    var currentPage = e.first / this.pageSize + 1;

    if (currentPage !== this.page) {
      this.page = currentPage;
      this.getSessions(this.page, e.rows);
    }
  }

  changeFilter() {
    this.first = 0;
  }

  generateMenuItems(item: RoamingSessionDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate('COMMON.VIEW-DETAILS'),
      routerLink: ['/sessions', item?.id]
    });

    menuItems.push({
      label: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
      disabled:
        item?.status !== RoamingSessionStatus.Charging &&
        item?.status !== RoamingSessionStatus.Accepted,
      command: () => this.cancelChargeConfirmation(item)
    });

    menuItems.push({
      label: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      disabled:
        item?.status !== RoamingSessionStatus.Charging &&
        item?.status !== RoamingSessionStatus.Accepted,
      command: () => {
        // this.stopChargeRequest.chargePointId = item?.chargePointInterestId;
        // this.stopChargeRequest.connectorId = item?.chargePointInterestSocketId;
        // this.stopChargeConfirmation(item);
      }
    });

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
            label: this.getEnumTypeTranslation(RoamingSessionStatus, status),
            icon: this.filter.status === status ? 'filter-icon' : null,
            command: () => {
              this.filter.status = status;
              this.getSessions(this.page, this.pageSize);
              this.selectedFilter = this.getEnumTypeTranslation(
                RoamingSessionStatus,
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

  cancelChargeConfirmation(item: RoamingSessionDto) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.CANCEL-CHARGE-DESCRIPTION',
        {
          connectorNumber: item?.connectorNo
        }
      ),
      confirmWithDescription: true,
      confirmDescriptionTitle: this.getTranslate(
        'PAGES.CHARGE-POINTS.CANCEL-CHARGE-REASON'
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.CANCEL-CHARGE'),
      confirmEventCallback: message => {
        // this.cancelSessionCommand.id = item?.id;
        // this.cancelSessionCommand.stopReason = message?.description;
        // this.cancelCharge(item);
      }
    };
    this.open(this.components.confirmationDialog);
  }

  cancelCharge(item: RoamingSessionDto) {
    // this.buttonLoading = true;
    // this.chargeSessionsService
    //   .chargeSessionsIdCancelPost(
    //     item?.id,
    //     this.xApplicationClientId,
    //     this.cancelSessionCommand
    //   )
    //   .subscribe({
    //     next: v => {
    //       this.notificationService.showSuccessToast(
    //         this.getTranslate('PAGES.CHARGE-POINTS.CANCELLING-CHARGE')
    //       );
    //       this.close();
    //       this.buttonLoading = false;
    //     },
    //     error: e => {
    //       this.notificationService.showErrorToast(this.handleError(e));
    //       this.close();
    //       this.buttonLoading = false;
    //     },
    //     complete: () => {
    //       setTimeout(() => {
    //         this.getSessions(this.page, this.pageSize);
    //       }, 600);
    //     }
    //   });
  }

  stopChargeConfirmation(item: RoamingSessionDto) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.STOP-CHARGE-DESCRIPTION',
        {
          connectorNumber: item?.connectorNo
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

  stopCharge(item: RoamingSessionDto) {
    // this.buttonLoading = true;
    // this.subscription.add(
    //   this.chargePointService
    //     .chargePointsIdStopPost(
    //       item?.chargePointId,
    //       this.xApplicationClientId,
    //       this.stopChargeRequest
    //     )
    //     .subscribe({
    //       next: v => {
    //         this.notificationService.showSuccessToast(
    //           this.getTranslate('PAGES.CHARGE-POINTS.STOPPING-CHARGE')
    //         );
    //         this.buttonLoading = false;
    //       },
    //       error: e => {
    //         this.notificationService.showErrorToast(this.handleError(e));
    //         this.close();
    //         this.buttonLoading = false;
    //       },
    //       complete: () => {
    //         this.close();
    //         setTimeout(() => {
    //           this.getSessions(this.page, this.pageSize);
    //         }, 600);
    //       }
    //     })
    // );
  }

  closeCalendar() {
    this.datePicker.overlayVisible = false;
  }
}
