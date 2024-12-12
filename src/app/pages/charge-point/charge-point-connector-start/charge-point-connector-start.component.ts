import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import {
  ConnectorType,
  RoamingConnectorDto,
  RoamingPointDto,
  RoamingPointsService,
  RoamingTariffDto,
  RoamingTariffsService,
  RoamingUserDetailDto,
  RoamingUsersService,
} from '../../../../../api';
import { BaseComponent } from '../../../shared/base.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';
import { Subject, debounceTime } from 'rxjs';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { HelperService } from '../../../@core/services/helper.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  SurgeFormComponent,
  CardWithAvatarComponent,
  AvatarSize,
  FormElementType,
  ButtonType,
  ButtonStyle,
  ButtonSize,
  Position,
  ButtonColor,
} from 'surge-components';

@Component({
  selector: 'app-charge-point-connector-start',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf,
    SurgeFormComponent,
    NgTemplateOutlet,
    CardWithAvatarComponent,
  ],
  templateUrl: './charge-point-connector-start.component.html',
  styleUrls: ['./charge-point-connector-start.component.scss'],
})
export class ChargePointConnectorStartComponent extends BaseComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() isChild: boolean;
  @Output() confirmEvent = new EventEmitter<any>();
  @Output() cancelEvent = new EventEmitter<any>();

  @ViewChild('tariffDropdownItemTemplate', { static: true, read: TemplateRef })
  tariffDropdownItemTemplate: TemplateRef<any>;

  @ViewChild('connectorDropdownItemTemplate', {
    static: true,
    read: TemplateRef,
  })
  connectorDropdownItemTemplate: TemplateRef<any>;

  @ViewChild('chargePointAutocompleteItemTemplate', {
    static: true,
    read: TemplateRef,
  })
  chargePointAutocompleteItemTemplate: TemplateRef<any>;

  @ViewChild('userAutocompleteItemTemplate', {
    static: true,
    read: TemplateRef,
  })
  userAutocompleteItemTemplate: TemplateRef<any>;

  confirmEventCallback: (eventData: any) => void;
  cancelEventCallback: (eventData: any) => void;

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'medium dark-gray')
  );

  cpBannerIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.CpIconStroked.name, 'xxxlarge white', true)
  );

  filteredUsers: RoamingUserDetailDto[];
  filterUserSubject = new Subject<any>();

  filterChargePoints: RoamingPointDto[];
  filterChargePointSubject = new Subject<any>();

  workspaceId: string;

  connectorResponse: RoamingConnectorDto;
  connectorsResponse: RoamingConnectorDto[];
  tariffsResponse: RoamingTariffDto[];
  userResponse: RoamingUserDetailDto;
  connectorTypes = ConnectorType;

  // startChargeRequest = <RemoteStartTransactionForAdminCommand>{};
  avatarSizes = AvatarSize;

  constructor(
    protected tariffService: RoamingTariffsService,
    protected userService: RoamingUsersService,
    protected chargePointService: RoamingPointsService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected helperService: HelperService,
    protected formBuilder: UntypedFormBuilder,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.workspaceId = this.config?.data?.workspaceId;
    this.connectorResponse = this.config?.data?.connector;
    this.userResponse = this.config?.data?.userResponse;

    this.myForm = this.formBuilder.group({
      chargePoint: [null, Validators.required],
      user: [null, Validators.required],
      fromSurgeApp: [false, Validators.required],
      connector: [null, Validators.required],
      tariffId: [null],
      couponId: [null],
    });

    this.setFormValues();

    this.subscription.add(
      this.filterUserSubject
        .pipe(debounceTime(400))
        .subscribe((event) => this.getUsers(event))
    );

    if (this.workspaceId) {
      this.getTariffs(this.page, 100000);
    }

    if (!this.config?.data?.chargePoint) {
      this.subscription.add(
        this.filterChargePointSubject
          .pipe(debounceTime(400))
          .subscribe((event) => this.getChargePoints(event))
      );
    }

    this.generateSurgeForm();
  }

  setFormValues() {
    this.myForm.patchValue({
      chargePoint: this.config?.data?.chargePoint || null,
      connector: this.connectorResponse || null,
      tariffId: this.connectorResponse?.tariff?.id || null,
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.confirmEventCallback = this.config.data.confirmEventCallback;
    this.confirmEvent.subscribe(this.confirmEventCallback);

    this.cancelEventCallback = this.config.data.cancelEventCallback;
    this.cancelEvent.subscribe(this.cancelEventCallback);

    this.formConfig.fields.find(
      (t) => t.formControlName === 'tariffId'
    ).dropdownItemContentTemplate = this.tariffDropdownItemTemplate;

    let chargePointFormControl = this.formConfig.fields.find(
      (t) => t.formControlName === 'chargePoint'
    );

    if (chargePointFormControl) {
      chargePointFormControl.dropdownItemContentTemplate = this.chargePointAutocompleteItemTemplate;
    }

    this.formConfig.fields.find(
      (t) => t.formControlName === 'user'
    ).dropdownItemContentTemplate = this.userAutocompleteItemTemplate;

    let connectorFormControl = this.formConfig.fields.find(
      (t) => t.formControlName === 'connector'
    );

    if (connectorFormControl) {
      connectorFormControl.dropdownItemContentTemplate = this.connectorDropdownItemTemplate;
    }
  }

  generateSurgeForm() {
    this.formConfig = {
      fields: [
        ...(!this.config?.data?.chargePoint
          ? [
              {
                type: FormElementType.Autocomplete,
                formControlName: 'chargePoint',
                label: this.getTranslate('PAGES.CHARGE-POINTS.CHARGE-POINT'),
                placeholder: this.getTranslate(
                  'PAGES.CHARGE-POINTS.TYPE-CHARGE-POINT'
                ),
                suggestions: this.filterChargePoints,
                multiple: false,
                forceSelection: true,
                showTransitionOptions: '0ms',
                hideTransitionOptions: '0ms',
                validationMessages: this.getTranslate('COMMON.REQUIRED'),
                autocompleteField: 'name',
                dropdownEmptyMessage: this.getTranslate('COMMON.NO-RESULT'),
              },
              {
                type: FormElementType.Dropdown,
                formControlName: 'connector',
                label: this.getTranslate('PAGES.CONNECTORS.CONNECTOR'),
                placeholder: this.getTranslate('COMMON.SELECT'),
                options: this.connectorsResponse,
                validationMessages: this.getTranslate('COMMON.REQUIRED'),
                dropdownOptionLabel: 'connectorNumber',
                dropdownShowClear: true,
              },
            ]
          : []),

        {
          type: FormElementType.Autocomplete,
          formControlName: 'user',
          label: this.getTranslate('PAGES.USERS.USER'),
          placeholder: this.getTranslate('PAGES.USERS.TYPE-USER'),
          suggestions: this.filteredUsers,
          multiple: false,
          forceSelection: true,
          showTransitionOptions: '0ms',
          hideTransitionOptions: '0ms',
          validationMessages: this.getTranslate('COMMON.REQUIRED'),
          autocompleteField: 'displayName',
          dropdownEmptyMessage: this.getTranslate('COMMON.NO-RESULT'),
        },
        {
          type: FormElementType.Dropdown,
          formControlName: 'tariffId',
          label: this.getTranslate('PAGES.TARIFFS.TARIFF'),
          placeholder: this.getTranslate('COMMON.SELECT'),
          options: this.tariffsResponse,
          validationMessages: this.getTranslate('COMMON.REQUIRED'),
          dropdownOptionLabel: 'name',
          dropdownOptionValue: 'id',
          dropdownShowClear: true,
          dropdownEmptyMessage: this.getTranslate('COMMON.NO-RESULT'),
        },
      ],
      buttons: [
        {
          type: ButtonType.Cancel,
          text: this.getTranslate('COMMON.CANCEL'),
          class: ButtonStyle.Text,
          size: ButtonSize.Large,
          position: Position.Right,
        },
        {
          type: ButtonType.Submit,
          text: this.getTranslate('PAGES.CHARGE-POINTS.START-CHARGE'),
          progressText: this.getTranslate('COMMON.PLEASE-WAIT'),
          color: ButtonColor.Blue,
          size: ButtonSize.Large,
          position: Position.Right,
        },
      ],
      showInfoTitle: true,
      formTitle: this.getTranslate('PAGES.CHARGE-POINTS.START-CHARGE'),
      formSubtitle: this.config?.data?.chargePoint
        ? this.getTranslate('PAGES.CHARGE-POINTS.START-CHARGE-DESCRIPTION', {
            connectorNumber: this.connectorResponse?.connectorNo,
          })
        : this.getTranslate(
            'PAGES.CHARGE-POINTS.START-CHARGE-DESCRIPTION-WITHOUT-NUMBER'
          ),
    };
  }

  completeMethodTriggered(event: any) {
    switch (event?.formControlName) {
      case 'chargePoint':
        this.filterChargePoint(event?.event);
        break;
      case 'user':
        this.filterUser(event?.event);
        break;

      default:
        break;
    }
  }

  selectTriggered(event: any) {
    switch (event?.formControlName) {
      case 'chargePoint':
        this.onChargePointSelect(event?.event);
        break;

      default:
        break;
    }
  }

  getTariffs(page: number, size: number) {
    this.loading = true;
    this.subscription.add(
      this.tariffService
        .tariffsGet(page, size, this.workspaceId, this.searchItem.value)
        .subscribe({
          next: (v) => {
            this.tariffsResponse = [];
            this.tariffsResponse = v.items;
            this.tariffsResponse.push(<RoamingTariffDto>{
              id: null,
              name: this.getTranslate('PAGES.TARIFFS.FREE'),
              basePrice: 0,
              currency: v.items[0]?.currency,
            });

            let connectorFormControl = this.formConfig.fields.find(
              (t) => t.formControlName === 'connector'
            );

            if (connectorFormControl) {
              connectorFormControl.options = this.connectorsResponse;
            }

            this.formConfig.fields.find(
              (x) => x.formControlName === 'tariffId'
            ).options = this.tariffsResponse;
          },
          error: (e) => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  filterUser(event: any) {
    this.filterUserSubject.next(event);
  }

  getUsers(event: any) {
    this.subscription.add(
      this.userService
        .usersGet(
          this.page,
          1000,
          event.query
        )
        .subscribe({
          next: (v) => {
            this.filteredUsers = [];
            this.filteredUsers = v.items;

            this.formConfig.fields.find(
              (x) => x.formControlName === 'user'
            ).suggestions = this.filteredUsers;
          },
          error: (e) => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  filterChargePoint(event: any) {
    this.filterChargePointSubject.next(event);
  }

  onChargePointSelect(chargePoint: RoamingPointDto) {
    this.connectorsResponse = [];
    this.connectorsResponse = chargePoint.sockets;

    this.getTariffs(this.page, 100000);
  }

  getChargePoints(event: any) {
    this.subscription.add(
      this.chargePointService
        .roamingPointsGet(
          this.page,
          1000,
        )
        .subscribe({
          next: (v) => {
            this.filterChargePoints = [];
            this.filterChargePoints = v.items;

            this.formConfig.fields.find(
              (x) => x.formControlName === 'chargePoint'
            ).suggestions = this.filterChargePoints;
          },
          error: (e) => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  onConnectorChange(event: any) {
    let connector = event?.value;

    this.myForm.patchValue({
      tariffId: connector?.tariff?.id || null,
    });
  }

  cancel() {
    this.cancelEvent.emit();
  }

  onFormSubmit(): void {
    // this.startChargeRequest.userId = this.myForm.get('user')?.value?.id || null;

    // if (this.startChargeRequest.userId) {
    //   this.startChargeRequest.chargePointId =
    //     this.myForm.get('chargePoint')?.value?.id || null;

    //   this.startChargeRequest.connectorId =
    //     this.myForm.get('connector')?.value?.id || null;

    //   this.startChargeRequest.connectorNumber =
    //     this.myForm.get('connector')?.value?.connectorNumber || null;

    //   this.startChargeRequest.fromSurgeApp = this.myForm.get(
    //     'fromSurgeApp'
    //   ).value;
    //   this.startChargeRequest.tariffId = this.myForm.get('tariffId').value;
    //   this.startChargeRequest.couponId = this.myForm.get('couponId').value;

      this.startCharge();
    // }
  }

  startCharge() {
    // this.buttonLoading = true;
    // this.myForm.disable();

    // this.subscription.add(
    //   this.chargePointService
    //     .chargePointsIdAdminStartPost(
    //       this.startChargeRequest?.chargePointId,
    //       this.startChargeRequest
    //     )
    //     .subscribe({
    //       next: (v) => {
    //         this.confirmEvent.emit();
    //         this.notificationService.showSuccessToast(
    //           this.getTranslate('PAGES.CHARGE-POINTS.STARTING-CHARGE')
    //         );
    //         this.submitted = false;
    //         this.buttonLoading = false;
    //         this.myForm.enable();
    //         this.close(true);
    //       },
    //       error: (e) => {
    //         this.notificationService.showErrorToast(this.handleError(e));
    //         this.myForm.enable();
    //         this.buttonLoading = false;
    //       },
    //       complete: () => {},
    //     })
    // );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.confirmEvent.unsubscribe();
    this.cancelEvent.unsubscribe();
  }
}
