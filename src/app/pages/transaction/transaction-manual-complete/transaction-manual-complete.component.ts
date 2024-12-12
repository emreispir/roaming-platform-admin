import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
  ManualCompleteRoamingTransactionCommand,
  RoamingTransactionsService
} from '../../../../../api';
import { NotificationService } from '../../../@core/services/notification.service';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import {
  SurgeFormComponent,
  FormElementType,
  InputType,
  ButtonType,
  ButtonStyle,
  ButtonSize,
  Position,
  ButtonColor
} from 'surge-components';

@Component({
  selector: 'app-transaction-manual-complete',
  templateUrl: './transaction-manual-complete.component.html',
  styleUrls: ['./transaction-manual-complete.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    SurgeFormComponent
  ]
})
export class TransactionManualCompleteComponent extends BaseComponent
  implements AfterViewInit, OnInit, OnDestroy {
  @Input() isChild: boolean;
  @Output() confirmEvent = new EventEmitter<any>();
  @Output() cancelEvent = new EventEmitter<any>();

  confirmEventCallback: (eventData: any) => void;
  cancelEventCallback: (eventData: any) => void;
  completeManuallyRequest: ManualCompleteRoamingTransactionCommand = {
    transactionId: null,
    message: null
  };

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  transactionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.TransactionIconStroked.name,
      'gigantic white filled-path',
      true
    )
  );

  constructor(
    protected sanitizer: DomSanitizer,
    protected translateService: TranslateService,
    protected cd: ChangeDetectorRef,
    public config: DynamicDialogConfig,
    protected transactionsService: RoamingTransactionsService,
    protected notificationService: NotificationService,
    protected formBuilder: UntypedFormBuilder
  ) {
    super(translateService);
    this.init();
  }

  ngOnInit() {
    this.confirmEventCallback = this.config.data.confirmEventCallback;
    this.subscription.add(
      this.confirmEvent.subscribe(this.confirmEventCallback)
    );

    this.cancelEventCallback = this.config.data.cancelEventCallback;
    this.subscription.add(this.cancelEvent.subscribe(this.cancelEventCallback));
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  cancel() {
    this.cancelEvent.emit();
  }

  init() {
    this.myForm = this.formBuilder.group({
      message: [null, Validators.required]
    });

    this.generateSurgeForm();
  }

  generateSurgeForm() {
    this.formConfig = {
      fields: [
        {
          type: FormElementType.Input,
          inputType: InputType.Text,
          formControlName: 'message',
          label: this.getTranslate('COMMON.DESCRIPTION'),
          placeholder: this.getTranslate('COMMON.DESCRIPTION'),
          validationMessages: this.getTranslate('COMMON.REQUIRED')
        }
      ],
      buttons: [
        {
          type: ButtonType.Cancel,
          text: this.getTranslate('COMMON.CANCEL'),
          class: ButtonStyle.Text,
          size: ButtonSize.Large,
          position: Position.Right
        },
        {
          type: ButtonType.Submit,
          text: this.getTranslate('PAGES.TRANSACTIONS.COMPLETE-MANUALLY'),
          progressText: this.getTranslate('COMMON.PLEASE-WAIT'),
          color: ButtonColor.Blue,
          size: ButtonSize.Large,
          position: Position.Right
        }
      ],
      showInfoTitle: true,
      formTitle: this.getTranslate('PAGES.TRANSACTIONS.COMPLETE-MANUALLY'),
      formSubtitle: this.getTranslate(
        'PAGES.TRANSACTIONS.COMPLETE-MANUALLY-DESCRIPTION'
      )
    };
  }

  onFormSubmit() {
    this.submitted = true;
    this.completeManuallyRequest.transactionId = this.config.data.transactionId;
    this.completeManuallyRequest.message = this.myForm.get('message').value;
    this.completeManually();
  }

  completeManually() {
    this.buttonLoading = true;
    this.myForm.disable();

    this.subscription.add(
      this.transactionsService
        .transactionsIdManualCompletePost(
          this.completeManuallyRequest.transactionId,
          this.completeManuallyRequest
        )
        .subscribe({
          next: v => {
            this.myForm.enable();
            this.submitted = false;

            this.confirmEvent.emit();
            this.notificationService.showSuccessToast(
              this.getTranslate('PAGES.TRANSACTIONS.COMPLETE-MANUALLY-SUCCESS')
            );

            this.buttonLoading = false;
          },
          error: e => {
            this.notificationService.showErrorToast(this.handleError(e));
            this.buttonLoading = false;
            this.myForm.enable();
          },
          complete: () => {}
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
