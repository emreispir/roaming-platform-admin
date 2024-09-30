import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { BaseComponent } from '../../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons } from '../../../../assets/svg/svg-variables';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    ButtonModule,
    DropdownModule
  ]
})
export class DeleteConfirmationComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() confirmEvent = new EventEmitter<any>();
  confirmEventCallback: (eventData: any) => void;
  @Output() dropdownSelectionChanged = new EventEmitter<void>();

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  constructor(
    protected translateService: TranslateService,
    public config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.confirmEventCallback = this.config.data.confirmEventCallback;
    this.confirmEvent.subscribe(this.confirmEventCallback);
  }

  onDeleteButtonClicked() {
    this.buttonLoading = true;
    if (this.config?.data?.dropdownDataRequired) {
      this.submitted = true;
      let data = this.config?.data?.selectedDropdownOption;
      if (data) {
        this.confirmEvent.emit(data);
      }
    } else {
      this.confirmEvent.emit();
    }
  }

  ngOnDestroy() {
    this.confirmEvent.unsubscribe();
    this.subscription.unsubscribe();
  }
}
