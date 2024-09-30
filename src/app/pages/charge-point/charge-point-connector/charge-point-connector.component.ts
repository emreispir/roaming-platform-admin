import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../@core/services/shared.service';
import { SelectItem } from 'primeng/api';
import {
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import {
  AssignTariffToConnectorsCommand,
  ChargePointDto,
  ChargePointsService,
  ConnectorDto,
  ConnectorStatus,
  ConnectorType,
  ConnectorsService,
  RemoteStopTransactionCommand,
  TariffDto,
  TariffsService,
  UnlockConnectorCommand,
  UpdateConnectorCommand
} from '../../../../../api';
import { NotificationService } from '../../../@core/services/notification.service';
import { ConfirmationDialogComponent } from '../../../@core/components/confirmation-dialog/confirmation-dialog.component';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { HelperService } from '../../../@core/services/helper.service';
import { ConnectorActionType } from '../../../@core/models/common';
import { QrCodeComponent } from '../../../@core/components/qr-code/qr-code.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { SignalRService } from '../../../@core/services/signalr.service';
import { ChargePointConnectorStartComponent } from '../charge-point-connector-start/charge-point-connector-start.component';
import { Policy } from '../../../@core/models/policy';
import { SurgeAvatarComponent } from 'surge-components';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-charge-point-connector',
  templateUrl: './charge-point-connector.component.html',
  styleUrls: ['./charge-point-connector.component.scss'],
  imports: [
    SurgeAvatarComponent,
    NgFor,
    NgClass,
    NgIf,
    DropdownModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    DatePipe,
    NgTemplateOutlet,
    InputTextModule
  ],
  standalone: true
})
export class ChargePointConnectorComponent extends BaseComponent
  implements AfterViewInit, OnChanges, OnDestroy {
  @Input() chargePointId: string = null;
  @Input() chargePointIsPaired: boolean;
  @Input() workspaceId: string = null;
  @Input() isChild: boolean;
  @Input() toolTipContent: string;

  connectorStatusTypes = ConnectorStatus;
  connectorStatusesResponse: SelectItem[];
  connectorTypesResponse: SelectItem[];
  connectorActionsResponse: {
    [key: string]: SelectItem[];
  } = {};
  connectorsResponse: ConnectorDto[];
  connectionError: string;
  connectorTypeRequest = <UpdateConnectorCommand>{};

  stopChargeRequest = <RemoteStopTransactionCommand>{};
  unlockConnectorRequest = <UnlockConnectorCommand>{};
  tariffsResponse: TariffDto[];

  applyTariffConnectorRequest = <AssignTariffToConnectorsCommand>{};

  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );

  saveIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.SaveIcon.name,
      'medium dark-blue filled-path',
      true
    )
  );

  constructor(
    protected signalRService: SignalRService,
    protected tariffService: TariffsService,
    protected translateService: TranslateService,
    protected sharedService: SharedService,
    protected chargePointService: ChargePointsService,
    protected connectorsService: ConnectorsService,
    protected notificationService: NotificationService,
    protected helperService: HelperService,
    protected cd: ChangeDetectorRef,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected formBuilder: UntypedFormBuilder,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.connectorStatusesResponse = this.generateSelectItemsFromEnum(
      ConnectorStatus
    );
    this.connectorTypesResponse = this.generateSelectItemsFromEnum(
      ConnectorType
    );

    this.components = {
      confirmationDialog: ConfirmationDialogComponent,
      qrCodeComponent: QrCodeComponent,
      connectorStart: ChargePointConnectorStartComponent
    };

    this.myForm = this.formBuilder.group({
      connectors: this.formBuilder.array([], [Validators.required])
    });
  }

  get connectors(): UntypedFormArray {
    return this.myForm.get('connectors') as UntypedFormArray;
  }

  addConnectorsControl(connectors: ConnectorDto[]) {
    while (this.connectors.length !== 0) {
      this.connectors.removeAt(0);
    }

    connectors.forEach(connector => {
      let foundedTariff = this.tariffsResponse.find(
        t => t.id === connector.tariff?.id
      );

      this.connectors.push(
        this.formBuilder.group({
          id: connector.id,
          type: connector.connectorType,
          externalId: connector.externalId,
          lastMeter: connector.lastMeter,
          lastMeterTime: connector.lastMeterTime,
          avatarPath: this.getConnectorAvatarPath(connector.connectorType),
          connectorNumber: connector.connectorNumber,
          actionType: null,
          status: connector.status,
          tariff: foundedTariff || null,
          qrCodeValue: connector.qrCodeValue
        })
      );
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chargePointId && changes.chargePointId.currentValue) {
      if (this.chargePointId) {
        this.getTariffs(this.page, 1000);
        this.subscribeToSignalrData();
      }
    }
  }

  subscribeToSignalrData() {
    this.subscription.add(
      this.signalRService
        .invokeData(
          'subscribe',
          this.chargePointId,
          this.sharedService?.userData?.id
        )
        .subscribe({
          next: v => {
            this.subscription.add(
              this.signalRService?.connectorHub.subscribe({
                next: v => {
                  if (v) {
                    const connectorControl = this.connectors.controls.find(
                      control => control.get('id').value === v.connectorId
                    );
                    if (connectorControl) {
                      connectorControl.get('status').setValue(v.status);
                      this.updateConnectorActions(connectorControl?.value);
                    }
                  }
                },
                error: e => {
                  console.error('Failed to connectorHub data:', e);
                },
                complete: () => {}
              })
            );
          },
          error: e => {
            console.error('Failed to receive data:', e);
          },
          complete: () => {}
        })
    );
  }

  getTariffs(page: number, size: number) {
    this.loading = true;
    this.subscription.add(
      this.tariffService
        .tariffsGet(page, size, this.workspaceId, this.searchItem.value)
        .subscribe({
          next: v => {
            this.tariffsResponse = [];
            this.tariffsResponse = v.items;
            this.chargePointConnectors();
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {}
        })
    );
  }

  getConnectorAvatarPath(connectorType: string): string {
    const connectorAvatarMap = {
      CCS1Combo: '../../../../assets/svg/ccs1.svg',
      CCS2Combo: '../../../../assets/svg/ccs2.svg',
      CHAdeMO: '../../../../assets/svg/chademo.svg',
      GB_TConnector: '../../../../assets/svg/gbt.svg',
      TeslaConnector: '../../../../assets/svg/tesla.svg',
      Type1Connector: '../../../../assets/svg/type1.svg',
      Type2Connector: '../../../../assets/svg/type2.svg',
      Undefined: '../../../../assets/svg/undefined.svg',
      Other: '../../../../assets/svg/undefined.svg'
    };

    return (
      connectorAvatarMap[connectorType] ||
      '../../../../assets/svg/undefined.svg'
    );
  }

  chargePointConnectors() {
    this.loading = true;
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdConnectorsGet(this.chargePointId)
        .subscribe({
          next: v => {
            this.connectorsResponse = [];
            this.connectorsResponse = v;

            this.connectorsResponse.sort(
              (a, b) => a.connectorNumber - b.connectorNumber
            );

            this.myForm = this.formBuilder.group({
              connectors: this.formBuilder.array([], [Validators.required]),
              actionType: [null]
            });
            this.addConnectorsControl(v);

            this.connectorsResponse.forEach(connector => {
              this.updateConnectorActions(connector);
            });
            this.buttonLoading = false;
          },
          error: e => {
            this.connectionError =
              'PAGES.CHARGE-POINTS.CONNECT-CONFIGURE-ERROR';
            this.notificationService.showErrorToast(this.connectionError);
            this.buttonLoading = false;
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        })
    );
  }

  updateConnectorActions(connector: ConnectorDto) {
    let actions: SelectItem[] = [];

    actions.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.UNLOCK_CONNECTOR.toUpperCase()}`
      ),
      value: ConnectorActionType.UNLOCK_CONNECTOR,
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointUnlock]) ||
        connector.status === ConnectorStatus.Available ||
        connector.status === ConnectorStatus.Faulted ||
        connector.status === ConnectorStatus.Reserved ||
        connector.status === ConnectorStatus.Undefined ||
        connector.status === ConnectorStatus.Unavailable
    });

    actions.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.START_CHARGE.toUpperCase()}`
      ),
      value: ConnectorActionType.START_CHARGE,
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointRemoteStart]) ||
        (connector.status !== ConnectorStatus.Available &&
          connector.status !== ConnectorStatus.Preparing)
    });

    actions.push({
      label: this.getTranslate(
        `ENUM.${ConnectorActionType.STOP_CHARGE.toUpperCase()}`
      ),
      value: ConnectorActionType.STOP_CHARGE,
      disabled:
        !this.isUserValidForPolicies([Policy.ChargePointRemoteStop]) ||
        (connector.status !== ConnectorStatus.Charging &&
          connector.status !== ConnectorStatus.SuspendedEV &&
          connector.status !== ConnectorStatus.SuspendedEVSE)
    });

    this.connectorActionsResponse[connector.id] = actions;
  }

  showQRCode(item: ConnectorDto) {
    this.dialogConfig.data = {
      qrData: item?.qrCodeValue,
      title: this.getTranslate('PAGES.CONNECTORS.CONNECTOR-PARAM', {
        param: item?.connectorNumber
      })
    };

    this.open(this.components.qrCodeComponent, this.dialogConfig);
  }

  updateConnectorType(connector: any, event: any) {
    this.buttonLoading = true;
    this.myForm.disable();

    this.connectorTypeRequest = {
      id: connector.get('id').value,
      connectorType: event.value
    };

    this.subscription.add(
      this.connectorsService
        .connectorsIdPut(
          connector.get('id').value,
          this.xApplicationClientId,
          this.connectorTypeRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.CONNECTORS.EDIT-SUCCESS')
            );
            this.close();
          },
          error: e => {
            this.buttonLoading = false;
            this.myForm.enable();
            this.notificationService.showErrorToast(this.handleError(e));
          },
          complete: () => {
            this.buttonLoading = false;
            this.myForm.enable();
            this.chargePointConnectors();
          }
        })
    );
  }

  changeSelectedConnector(connector: any, event: any) {
    this.dialogConfig.data = {
      description: this.getTranslate('PAGES.CONNECTORS.CONNECTOR-CHANGE'),
      buttonText: this.getTranslate('COMMON.YES'),

      confirmEventCallback: (eventData: any) => {
        this.buttonLoading = true;
        this.updateConnectorType(connector, event);
      },
      cancelEventCallback: (eventData: any) => {
        let previousConnector = this.connectorsResponse.find(
          x => x.id === connector.get('id').value
        );
        connector.patchValue({
          type: previousConnector.connectorType
        });
      }
    };

    this.open(this.components.confirmationDialog);
  }

  changeConnectorAction(connector: any, action: ConnectorActionType) {
    this.loading = true;
    switch (action) {
      case ConnectorActionType.START_CHARGE:
        this.startChargeConfirmation(connector);
        this.loading = false;
        break;
      case ConnectorActionType.STOP_CHARGE:
        this.loading = true;
        this.stopChargeRequest.chargePointId = this.chargePointId;
        this.stopChargeRequest.connectorId = connector?.value?.id;
        this.stopChargeConfirmation(connector);
        this.loading = false;
        break;
      case ConnectorActionType.UNLOCK_CONNECTOR:
        this.unlockConnectorRequest.chargePointId = this.chargePointId;
        this.unlockConnectorRequest.connectorNumber =
          connector?.value?.connectorNumber;
        this.unlockConnectorRequest.connectorId = connector?.value?.id;
        this.unlockConnectorConfirmation(connector);
        this.loading = false;
        break;

      default:
        this.loading = false;
        break;
    }
  }

  startChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      isChild: true,
      connector: connector?.value,
      chargePoint: <ChargePointDto>{ id: this.chargePointId },
      workspaceId: this.workspaceId,
      confirmEventCallback: (eventData: any) => {
        connector.patchValue({
          actionType: null
        });
        this.close();
      },
      cancelEventCallback: (eventData: any) => {
        this.close();
        connector.patchValue({
          actionType: null
        });
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
          connectorNumber: connector?.value?.connectorNumber
        }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.STOP-CHARGE'),
      confirmEventCallback: (eventData: any) => {
        this.stopCharge(connector);
      },
      cancelEventCallback: (eventData: any) => {
        connector.patchValue({
          actionType: null
        });
      }
    };
    this.open(this.components.confirmationDialog);
  }

  stopCharge(connector: any) {
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdStopPost(
          this.chargePointId,
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
            connector.patchValue({
              actionType: null
            });
            this.buttonLoading = false;
          },
          complete: () => {
            connector.patchValue({
              actionType: null
            });
            this.close();
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
          connectorNumber: connector?.value?.connectorNumber
        }
      ),
      buttonText: this.getTranslate('PAGES.CHARGE-POINTS.UNLOCK-CONNECTOR'),
      confirmEventCallback: (eventData: any) => {
        this.unlockConnector(connector);
      },
      cancelEventCallback: (eventData: any) => {
        connector.patchValue({
          actionType: null
        });
      }
    };
    this.open(this.components.confirmationDialog);
  }

  unlockConnector(connector: any) {
    this.buttonLoading = true;
    this.subscription.add(
      this.chargePointService
        .chargePointsIdUnlockPost(
          this.chargePointId,
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
            connector.patchValue({
              actionType: null
            });
            this.buttonLoading = false;
          },
          complete: () => {
            connector.patchValue({
              actionType: null
            });
            this.close();
          }
        })
    );
  }

  updateConnector(connector: any) {
    if (
      !connector.get('externalId').value &&
      !connector.get('qrCodeValue').value
    ) {
      this.notificationService.showErrorToast(
        `${this.getTranslate('COMMON.EXTERNAL-ID')} ${this.getTranslate(
          'COMMON.OR'
        )} ${this.getTranslate(
          'PAGES.CONNECTORS.QR-CODE-VALUE'
        )} ${this.getTranslate('COMMON.MUST-NOT-NULL')}`
      );
      return false;
    }

    this.loading = true;
    this.myForm.disable();

    this.connectorTypeRequest = {
      id: connector.get('id').value,
      externalId: connector.get('externalId').value,
      qrCodeValue: connector.get('qrCodeValue').value
    };

    this.subscription.add(
      this.connectorsService
        .connectorsIdPut(
          this.connectorTypeRequest?.id,
          this.xApplicationClientId,
          this.connectorTypeRequest
        )
        .subscribe({
          next: v => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.CONNECTORS.EDIT-SUCCESS')
            );
            this.close();
          },
          error: e => {
            this.loading = false;
            this.myForm.enable();
            this.notificationService.showErrorToast(this.handleError(e));
          },
          complete: () => {
            this.loading = false;
            this.myForm.enable();
            this.chargePointConnectors();
          }
        })
    );
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.signalRService.invokeData(
        'unsubscribe',
        this.chargePointId,
        this.sharedService?.userData?.id
      );
    }
    this.subscription.unsubscribe();
  }
}
