import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { BaseComponent } from '../../../shared/base.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons } from '../../../../assets/svg/svg-variables';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    ButtonModule
  ]
})
export class ConfirmationDialogComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() confirmEvent = new EventEmitter<any>();
  @Output() cancelEvent = new EventEmitter<any>();

  confirmEventCallback: (eventData: any) => void;
  cancelEventCallback: (eventData: any) => void;

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  constructor(
    protected translateService: TranslateService,
    public config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected sanitizer: DomSanitizer,
    protected formBuilder: UntypedFormBuilder
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.myForm = this.formBuilder.group({
      description: [
        null,
        this.config?.data?.confirmWithDescription ? Validators.required : null
      ]
    });
  }

  ngOnInit() {
    this.confirmEventCallback = this.config.data.confirmEventCallback;
    this.confirmEvent.subscribe(this.confirmEventCallback);

    this.cancelEventCallback = this.config.data.cancelEventCallback;
    this.cancelEvent.subscribe(this.cancelEventCallback);
  }

  onConfirmButtonClicked() {
    if (this.config?.data?.confirmWithDescription) {
      this.submitted = true;
      if (this.myForm.valid) {
        this.buttonLoading = true;
        this.confirmEvent.emit({
          description: this.myForm.get('description')?.value
        });
      }
    } else {
      this.buttonLoading = true;
      this.confirmEvent.emit();
    }
  }

  cancel() {
    this.cancelEvent.emit();

    this.close();
  }

  ngOnDestroy() {
    this.confirmEvent.unsubscribe();
    this.cancelEvent.unsubscribe();
    this.subscription.unsubscribe();
  }
}
