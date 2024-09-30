import { NgIf } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonColor,
  ButtonSize,
  ButtonStyle,
  ButtonType,
  DynamicFormConfig,
  FormElementType,
  InputType,
  Position,
  StepType,
  SurgeFormComponent
} from 'surge-components';
import { BaseComponent } from '../../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { NotificationService } from '../../../@core/services/notification.service';
import { SharedService } from '../../../@core/services/shared.service';
import { Policy } from '../../../@core/models/policy';
import { Icons } from '../../../../assets/svg/svg-variables';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SurgeFormComponent
  ],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  @Input() directoryId: string;
  otpInfoFormConfig: DynamicFormConfig;
  otpCodeInfoFormConfig: DynamicFormConfig;
  userResponseConfig: DynamicFormConfig;

  backIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      Icons.ArrowDownIcon.name,
      'medium black filled-path r-90'
    )
  );

  authenticatedUserId: string = null;

  constructor(
    public sharedService: SharedService,
    protected notificationService: NotificationService,
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected formBuilder: FormBuilder
  ) {
    super(translateService);
    this.init();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  init() {
    this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
      ? this.getDecodedUserToken()?.extension_DirectoryId
      : null;

    this.myForm = this.formBuilder.group({
      otpInfo: this.formBuilder.group({
        mobilePhone: [null, Validators.required]
      }),
      otpCodeInfo: this.formBuilder.group({
        smsOtpCode: [null, Validators.required]
      })
    });

    this.generateOtpInfoForm();
  }

  ngOnInit() {
    if (this.stepNumber === 2) {
      this.startTimer();
    }
  }

  startTimer() {
    let timeLeft = 30;
    const interval = setInterval(() => {
      if (timeLeft > 0) {
        this.otpCodeInfoFormConfig.buttons.find(
          t => t.actionType === 'Resend'
        ).text = this.getTranslate('PAGES.OTP.RESEND-OTP-CODE', {
          time: timeLeft
        });
        timeLeft--;
      } else {
        clearInterval(interval);
        this.otpCodeInfoFormConfig.buttons.find(
          t => t.actionType === 'Resend'
        ).class = '';
        this.otpCodeInfoFormConfig.buttons.find(
          t => t.actionType === 'Resend'
        ).text = this.getTranslate('PAGES.OTP.RESEND-OTP-CODE', { time: '0' });
      }
    }, 1000);
  }

  generateOtpInfoForm() {
    this.otpInfoFormConfig = {
      fields: [
        {
          type: FormElementType.Input,
          inputType: InputType.Text,
          formControlName: 'mobilePhone',
          label: this.getTranslate('PAGES.OTP.PHONE-NUMBER'),
          placeholder: this.getTranslate(
            'PAGES.OTP.TYPE-PHONE-NUMBER-WITH-COUNTRY-CODE'
          ),
          validationMessages: this.getTranslate('COMMON.REQUIRED')
        }
      ],
      buttons: this.generateSurgeFormButtons(),
      showInfoTitle: true,
      formTitle: this.getTranslate('PAGES.OTP.USER-VERIFICATION'),
      formSubtitle: this.getTranslate('PAGES.OTP.OTP-INFO-TOOLTIP'),
      toolTipContent: this.getTranslate('PAGES.OTP.OTP-INFO-TOOLTIP')
    };

    this.buttonLoading = false;
  }

  generateOtpCodeInfoForm() {
    this.otpCodeInfoFormConfig = {
      fields: [
        {
          type: FormElementType.Input,
          inputType: InputType.Text,
          formControlName: 'smsOtpCode',
          label: this.getTranslate('PAGES.OTP.OTP-CODE'),
          placeholder: this.getTranslate('PAGES.OTP.TYPE-OTP-CODE'),
          validationMessages: this.getTranslate('COMMON.REQUIRED')
        }
      ],
      buttons: this.generateSurgeFormButtons(),
      showInfoTitle: true,
      formTitle: this.getTranslate('PAGES.OTP.USER-VERIFICATION'),
      formSubtitle: this.getTranslate('PAGES.OTP.OTP-INFO-TOOLTIP'),
      toolTipContent: this.getTranslate('PAGES.OTP.OTP-INFO-TOOLTIP')
    };

    this.buttonLoading = false;
  }

  generateSurgeFormButtons(): any[] {
    const buttons = [];

    if (this.stepNumber > 1) {
      buttons.push({
        type: ButtonType.Button,
        actionType: StepType.Previous,
        text: this.getTranslate('COMMON.BACK'),
        color: ButtonColor.Gray,
        size: ButtonSize.Large,
        buttonSvgIcon: this.backIcon,
        position: Position.Left
      });
    }

    if (this.stepNumber === 1) {
      buttons.push({
        type: ButtonType.Button,
        actionType: StepType.Next,
        text: this.getTranslate('PAGES.OTP.SEND-OTP-CODE'),
        progressText: this.getTranslate('COMMON.WAITING'),
        color: ButtonColor.Blue,
        size: ButtonSize.Large,
        position: Position.Right
      });
    }

    if (this.stepNumber === 2) {
      buttons.push({
        type: ButtonType.Button,
        actionType: 'Resend',
        text: this.getTranslate('PAGES.OTP.RESEND-OTP-CODE', { time: 30 }),
        color: ButtonColor.Orange,
        size: ButtonSize.Large,
        position: Position.Right,
        buttonStyle: ButtonStyle.Text,
        class: 'disabled'
      });

      this.startTimer();
    }

    if (this.stepNumber === 2) {
      buttons.push({
        type: ButtonType.Button,
        actionType: StepType.Next,
        text: this.getTranslate('PAGES.OTP.VALIDATE-OTP-CODE'),
        progressText: this.getTranslate('COMMON.WAITING'),
        color: ButtonColor.Blue,
        size: ButtonSize.Large,
        position: Position.Right
      });
    }

    return buttons;
  }

  nextStep(type: any) {
    let currentFormGroup = null;
    if (type === StepType.Next) {
      switch (this.stepNumber) {
        case 1:
          currentFormGroup = this.myForm.get('otpInfo') as UntypedFormGroup;
          break;
        case 2:
          currentFormGroup = this.myForm.get('otpCodeInfo') as UntypedFormGroup;
          break;
      }

      if (currentFormGroup) {
        if (this.isCurrentStepValid(currentFormGroup)) {
          this.navigateToStep(this.stepNumber);
        } else {
          this.markCurrentStepAsTouched(currentFormGroup);
        }
      }
    } else if (type === 'Resend') {
      this.resendOtpCode();
    } else {
      this.stepNumber = this.stepNumber - 1;
    }
  }

  navigateToStep(stepNumber: number): void {
    switch (stepNumber) {
      case 1:
        this.sendOtpCode();
        break;
      case 2:
        this.validateOtpCode();
        break;
    }
  }

  sendOtpCode() {
    this.buttonLoading = true;

    setTimeout(() => {
      this.stepNumber = this.stepNumber + 1;
      this.generateOtpCodeInfoForm();
    }, 1000);
  }

  resendOtpCode() {
    this.buttonLoading = true;

    setTimeout(() => {
      this.notificationService.showSuccessToast(
        this.getTranslate('PAGES.OTP.RESEND-OTP-CODE-SUCCESS')
      );

      this.buttonLoading = false;
      this.otpCodeInfoFormConfig.buttons.find(
        t => t.actionType === 'Resend'
      ).class = 'disabled';

      this.startTimer();
    }, 1000);
  }

  validateOtpCode() {
    this.buttonLoading = true;
    setTimeout(() => {
      let userPolicies = this.sharedService.getUserPolicies();
      if (!userPolicies.includes(Policy.UserRead)) {
        userPolicies.push(Policy.UserRead);
        this.sharedService.setUserPoliciesData(userPolicies);
      }

      this.authenticatedUserId = '63b6a0ea-36b3-42fc-85d4-906a0fd96f24';
      this.router.navigate(['/users', this.authenticatedUserId]);
    }, 1000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
