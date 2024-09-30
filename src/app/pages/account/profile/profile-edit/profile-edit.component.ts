import {
  ChangeDetectorRef,
  Component,
  Input,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { NotificationService } from '../../../../@core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../../shared/base.component';
import { SharedService } from '../../../../@core/services/shared.service';
import { NgClass, NgIf } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { HelperService } from '../../../../@core/services/helper.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ActivatedRoute } from '@angular/router';
import { UpdateUserCommand, UsersService } from '../../../../../../api';
import {
  SurgeFormComponent,
  FormElementType,
  InputType,
  ButtonType,
  ButtonColor,
  ButtonSize,
  Position,
} from 'surge-components';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    NgClass,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    SurgeFormComponent,
  ],
})
export class ProfileEditComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  @Input() isChild: boolean;

  userRequest = <UpdateUserCommand>{
    firstName: null,
    lastName: null,
    email: null,
    streetAddress: null,
    postalCode: null,
    city: null,
    state: null,
  };

  constructor(
    protected userService: UsersService,
    protected sharedService: SharedService,
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected helperService: HelperService,
    protected formBuilder: UntypedFormBuilder,
    public activatedRoute: ActivatedRoute,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    protected cd: ChangeDetectorRef
  ) {
    super(translateService);
    this.init();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  init() {
    this.myForm = this.formBuilder.group({
      userInfo: this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        streetAddress: ['', Validators.required],
        postalCode: ['', Validators.required],
        city: ['', Validators.required],
        state: [''],
      }),
    });

    this.setFormValues();
  }

  setFormValues() {
    if (this.sharedService?.userData) {
      this.userRequest = this.helperService.map(
        this.sharedService?.userData,
        this.userRequest
      );

      this.myForm.patchValue({
        userInfo: {
          firstName: this.sharedService?.userData?.firstName,
          lastName: this.sharedService?.userData?.lastName,
          email: this.sharedService?.userData?.email,
          streetAddress: this.sharedService?.userData?.streetAddress,
          postalCode: this.sharedService?.userData?.postalCode,
          city: this.sharedService?.userData?.city,
          state: this.sharedService?.userData?.state,
        },
      });
    }

    this.generateSurgeForm();
  }

  generateSurgeForm() {
    this.formConfig = {
      fields: [
        {
          type: FormElementType.Group,
          fields: [
            {
              type: FormElementType.Input,
              inputType: InputType.Text,
              formControlName: 'firstName',
              label: this.getTranslate('PAGES.USERS.NAME'),
              validationMessages: this.getTranslate('COMMON.REQUIRED'),
            },
            {
              type: FormElementType.Input,
              inputType: InputType.Text,
              formControlName: 'lastName',
              label: this.getTranslate('PAGES.USERS.SURNAME'),
              validationMessages: this.getTranslate('COMMON.REQUIRED'),
            },
          ],
        },
        {
          type: FormElementType.Input,
          inputType: InputType.Email,
          formControlName: 'email',
          label: this.getTranslate('PAGES.USERS.EMAIL'),
          validationMessages: this.getTranslate('COMMON.REQUIRED'),
        },
        {
          type: FormElementType.Group,
          fields: [
            {
              type: FormElementType.Input,
              inputType: InputType.Text,
              formControlName: 'city',
              label: this.getTranslate('COMMON.CITY'),
              validationMessages: this.getTranslate('COMMON.REQUIRED'),
            },
            {
              type: FormElementType.Input,
              inputType: InputType.Text,
              formControlName: 'postalCode',
              label: this.getTranslate('COMMON.ZIP'),
              validationMessages: this.getTranslate('COMMON.REQUIRED'),
            },
          ],
        },
        {
          type: FormElementType.Input,
          inputType: InputType.Text,
          formControlName: 'streetAddress',
          label: this.getTranslate('COMMON.AVENUE-STREET'),
          validationMessages: this.getTranslate('COMMON.REQUIRED'),
        },
      ],
      buttons: [
        {
          type: ButtonType.Submit,
          text: this.getTranslate('PAGES.PROFILE.UPDATE'),
          progressText: this.getTranslate('COMMON.SAVING'),
          color: ButtonColor.Blue,
          size: ButtonSize.Large,
          position: Position.Right,
        },
      ],
      showInfoTitle: true,
      formTitle: this.getTranslate('PAGES.USERS.EDIT-USER'),
      formSubtitle: this.getTranslate('PAGES.USERS.EDIT-USER-DESCRIPTION'),
    };
  }

  onFormSubmit(): void {
    const formValues = this.myForm.value.userInfo;

    this.userRequest = {
      ...this.userRequest,
      ...formValues,
    };

    this.editProfile();
  }

  editProfile() {
    this.buttonLoading = true;
    this.myForm.disable();

    this.subscription.add(
      this.userService
        .usersIdPut(
          this.sharedService?.userData?.id,
          this.xApplicationClientId,
          this.userRequest
        )
        .subscribe({
          next: (v) => {
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.PROFILE.EDIT-SUCCESS')
            );
            this.submitted = false;
            this.getMe();
          },
          error: (e) => {
            this.buttonLoading = false;
            this.notificationService.showErrorToast(this.handleError(e));
            this.myForm.enable();
          },
          complete: () => {
            this.buttonLoading = false;
            this.myForm.enable();
          },
        })
    );
  }

  getMe() {
    this.loading = true;
    this.subscription.add(
      this.userService.usersIdGet(this.getDecodedUserToken()?.oid).subscribe({
        next: (v) => {
          this.sharedService.changedUserData(v);
        },
        error: (e) => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
