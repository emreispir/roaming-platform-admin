import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DatePipe, DecimalPipe, NgClass, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import {
  ConnectorStatus,
  RemoteStopTransactionCommand,
  UnlockConnectorCommand,
  ConnectorsService,
  ChargePointsService,
  ConnectorType,
  ConnectorExtendedDto,
  ChargePointDto
} from '../../../../../api';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import { QrCodeComponent } from '../../../@core/components/qr-code/qr-code.component';
import { ConnectorActionType } from '../../../@core/models/common';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { ChargePointConnectorStartComponent } from '../../charge-point/charge-point-connector-start/charge-point-connector-start.component';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { debounceTime } from 'rxjs';
import { Policy } from '../../../@core/models/policy';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import {
  DataTableComponent,
  CardWithAvatarComponent,
  DynamicMenuComponent
} from 'surge-components';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InfoPanelComponent } from '../../../@core/components/info-panel/info-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-connector-list',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    RouterModule,
    TranslateModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderPanelComponent,
    LoaderComponent,
    InfoPanelComponent,
    InfoCardComponent,
    DataTableComponent
  ],
  templateUrl: './connector-list.component.html',
  styleUrls: ['./connector-list.component.scss']
})
export class ConnectorListComponent extends ScrollableComponent
  implements AfterViewInit, OnDestroy, OnInit {
  @Input() directoryId: string = this.getDecodedUserToken()
    ?.extension_DirectoryId;
  @Input() workspaceId: string = null;
  @Input() chargePointId: string = null;
  @Input() chargePointIsPaired: boolean;
  @Input() isChild: boolean;
  @Input() isBox: boolean;
  @Input() showActionbar: boolean;
  @Input() showActionbarTitle: boolean;
  @Input() showActionbarSearch: boolean = true;
  @Input() showActionbarFilter: boolean = true;
  @Input() showActionbarButton: boolean;
  @Input() isPaginated: boolean = false;
  @Input() toolTipContent: string;

  connectorStatusTypes = ConnectorStatus;
  connectorTypes = ConnectorType;

  connectorsResponse: ConnectorExtendedDto[];
  filteredConnectors: ConnectorExtendedDto[];

  stopChargeRequest = <RemoteStopTransactionCommand>{};
  unlockConnectorRequest = <UnlockConnectorCommand>{};

  infoPanelTitle = this.getTranslate('PAGES.CONNECTORS.CONNECTOR-YET');
  infoPanelDescription = this.getTranslate(
    'PAGES.CONNECTORS.CONNECTOR-YET-DESCRIPTION'
  );
  infoPanelImageUrl: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.InfoPanelIllustration.name, '')
  );

  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
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
  tariffIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RateIcon.name, 'regular black')
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
  plusIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'regular')
  );
  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small black')
  );
  refreshIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.RefreshIcon.name, 'small')
  );

  constructor(
    protected translateService: TranslateService,
    protected sharedService: SharedService,
    protected chargePointService: ChargePointsService,
    protected connectorsService: ConnectorsService,
    protected notificationService: NotificationService,
    // protected helperService: HelperService,
    protected cd: ChangeDetectorRef,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.components = {
      confirmationDialog: ConfirmationDialogComponent,
      qrCodeComponent: QrCodeComponent,
      connectorStart: ChargePointConnectorStartComponent
    };
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
          label: this.getTranslate('PAGES.CONNECTORS.CONNECTORS'),
          routerLink: '/connectors'
        }
      ];

      this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    }
    super.ngAfterViewInit();
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.tableConfig.lazy = false;
    this.tableConfig.loadLazy = null;
    this.tableConfig.isPaginated = false;

    if (this.isChild === undefined) {
      this.subscription.add(this.getConnectors());
    }

    this.subscription.add(
      this.searchItem.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        const searchValue = this.searchItem?.value?.trim().toLowerCase() || '';

        if (searchValue.length >= 3 || searchValue.length === 0) {
          this.checkSearchActive(searchValue, this.selectedFilter);

          if (searchValue) {
            this.filteredConnectors = this.connectorsResponse.filter(
              t =>
                t.chargePointName?.toLowerCase().includes(searchValue) ||
                t.chargePointReadableId?.toLowerCase().includes(searchValue)
            );
          } else {
            this.filteredConnectors = this.connectorsResponse;
          }

          this.totalItemCount = this.filteredConnectors.length;
          this.tableConfig.totalItemCount = this.filteredConnectors.length;

          this.checkSearchActive(this.searchItem.value, this.selectedFilter);
          this.generateDataTable();
        }
      })
    );
  }

  getConnectors() {
    this.loading = true;
    this.subscription.add(
      this.connectorsService
        .connectorsGet(
          this.chargePointId,
          this.directoryId,
          this.workspaceId,
          null,
          null,
          this.xApplicationClientId
        )
        .subscribe({
          next: v => {
            this.connectorsResponse = [];
            this.connectorsResponse = v;
            this.filteredConnectors = v;
            this.totalItemCount = v.length;
            this.tableConfig.totalItemCount = v.length;

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

  addChargePoint() {
    this.dialogConfig.data = {
      isChild: true
    };

    this.open(this.components.chargePointCreate, this.dialogConfig);

    this.subscription.add(
      this.dialogRef.onClose.subscribe(result => {
        if (result) {
          this.getConnectors();
        }
      })
    );
  }

  resetFilter(): void {
    this.loading = true;
    this.filter = {};
    this.selectedFilter = null;
    this.searchItem.setValue(null);
  }

  generateDataTable() {
    this.tableColumns = [
      {
        field: 'chargePointName',
        header: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
        visible: true,
        sortableColumnEnable: true,
        sortableColumnField: 'chargePointName',
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          routePath: '/charge-points/{{chargePointId}}',
          showAvatar: true,
          svgElement: this.chargePointIcon
        },
        templateInputs: {
          title: 'chargePointName',
          subtitleFirst: 'chargePointReadableId',
          pointClassName: (item: ConnectorExtendedDto) =>
            item?.chargePointStatus?.toLocaleLowerCase()
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.CONNECTORS.TITLE'),
        visible: true,
        sortableColumnEnable: true,
        sortableColumnField: 'status',
        templateComponent: CardWithAvatarComponent,
        templateConfig: {
          routePath: '/charge-points/{{chargePointId}}/connectors',
          showTag: true,
          backgroundedTag: true
        },
        templateInputs: {
          title: item =>
            this.getTranslate('PAGES.CONNECTORS.CONNECTOR-PARAM', {
              param: `${item?.connectorNumber}`
            }),
          subtitleFirst: item =>
            `${this.getEnumTypeTranslation(
              this.connectorTypes,
              item?.connectorType
            )}` || '-',
          tagValue: item =>
            this.getEnumTypeTranslation(ConnectorStatus, item.status),
          tagClass: item => item.status?.toLowerCase()
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.TARIFFS.TARIFF'),
        visible: true,
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.tariff?.name || '-',
          subtitleFirst: item =>
            `${
              this.getDecodedUserToken()?.extension_Directory?.currencyDto
                ?.symbol
            }${item?.tariff?.basePrice}`
        },
        templatePipes: {
          subtitleFirst: [
            {
              name: DecimalPipe,
              args: ['1.2-2'],
              inputFields: ['tariff.basePrice']
            }
          ]
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.CONNECTORS.LAST-STATUS-TIME'),
        visible: true,
        sortableColumnEnable: true,
        sortableColumnField: 'lastStatusTime',
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.lastStatusTime || '-',
          subtitleFirst: 'lastStatusTime'
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['lastStatusTime']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['HH:mm:ss'],
              inputFields: ['lastStatusTime']
            }
          ]
        }
      },
      {
        field: '',
        header: this.getTranslate('PAGES.CHARGE-POINTS.LAST-HEART-BEAT-TIME'),
        visible: true,
        sortableColumnEnable: true,
        sortableColumnField: 'chargePointLastHeartBeatTime',
        templateComponent: CardWithAvatarComponent,
        templateInputs: {
          title: item => item?.chargePointLastHeartBeatTime || '-',
          subtitleFirst: 'chargePointLastHeartBeatTime'
        },
        templatePipes: {
          title: [
            {
              name: DatePipe,
              args: ['dd MMM y', this.sharedService.language],
              inputFields: ['chargePointLastHeartBeatTime']
            }
          ],
          subtitleFirst: [
            {
              name: DatePipe,
              args: ['HH:mm:ss'],
              inputFields: ['chargePointLastHeartBeatTime']
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

  generateMenuItems(connector: ConnectorExtendedDto): MenuItem[] {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.UNLOCK_CONNECTOR.toUpperCase()}`
      ),
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointUnlock]) ||
        connector.status === ConnectorStatus.Available ||
        connector.status === ConnectorStatus.Faulted ||
        connector.status === ConnectorStatus.Reserved ||
        connector.status === ConnectorStatus.Undefined ||
        connector.status === ConnectorStatus.Unavailable,
      command: () => {
        this.unlockConnectorRequest.chargePointId = connector?.chargePointId;
        this.unlockConnectorRequest.connectorNumber =
          connector?.connectorNumber;
        this.unlockConnectorRequest.connectorId = connector?.id;
        this.unlockConnectorConfirmation(connector);
      }
    });

    menuItems.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.START_CHARGE.toUpperCase()}`
      ),
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointRemoteStart]) ||
        (connector.status !== ConnectorStatus.Available &&
          connector.status !== ConnectorStatus.Preparing),
      command: () => {
        this.startChargeConfirmation(connector);
      }
    });

    menuItems.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.STOP_CHARGE.toUpperCase()}`
      ),
      styleClass: 'pink',
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointRemoteStop]) ||
        (connector.status !== ConnectorStatus.Charging &&
          connector.status !== ConnectorStatus.SuspendedEV &&
          connector.status !== ConnectorStatus.SuspendedEVSE),
      command: () => {
        this.stopChargeRequest.chargePointId = connector?.chargePointId;
        this.stopChargeRequest.connectorId = connector?.id;
        this.stopChargeConfirmation(connector);
      }
    });

    menuItems.push({
      label: this.getTranslate('COMMON.VIEW-QR-CODE'),
      disabled: !this.isUserValidForPolicies([Policy.ChargePointRead]),
      command: () => {
        this.showQRCode(connector);
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
              this.getConnectors();
              this.selectedFilter = null;
            }
          }
        ]
      }
    ]);
  }

  showQRCode(item: ConnectorExtendedDto) {
    this.dialogConfig.data = {
      qrData: item?.qrCodeValue,
      title: this.getTranslate('PAGES.CONNECTORS.CONNECTOR-PARAM', {
        param: item?.connectorNumber
      })
    };

    this.open(this.components.qrCodeComponent, this.dialogConfig);
  }

  startChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      isChild: true,
      connector: connector,
      chargePoint: <ChargePointDto>{ id: connector?.chargePointId },
      workspaceId: connector?.workspaceId,
      confirmEventCallback: (eventData: any) => {
        this.getConnectors();
        this.close();
      },
      cancelEventCallback: (eventData: any) => {
        this.getConnectors();
        this.close();
      }
    };

    this.open(this.components.connectorStart);
  }

  stopChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      title: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      description: this.getTranslate(
        'PAGES.CHARGE-POINTS.STOP-CHARGE-DESCRIPTION',
        {
          connectorNumber: connector?.connectorNumber
        }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      confirmEventCallback: (eventData: any) => {
        this.stopCharge(connector);
      },
      cancelEventCallback: (eventData: any) => {}
    };
    this.open(this.components.confirmationDialog);
  }

  stopCharge(connector: any) {
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdStopPost(
          connector?.chargePointId,
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
            this.getConnectors();
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
            this.getConnectors();
          }
        })
    );
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }
}
