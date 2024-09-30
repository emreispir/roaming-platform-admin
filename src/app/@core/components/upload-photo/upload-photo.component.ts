import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { NgFor, NgIf } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-upload-photo',
  standalone: true,
  imports: [
    TranslateModule,
    ButtonModule,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
  ],
  templateUrl: './upload-photo.component.html',
  styleUrls: ['./upload-photo.component.scss'],
})
export class UploadPhotoComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Output() fileUploaded = new EventEmitter<Array<Blob>>();
  @Output() removeFileEvent = new EventEmitter<any[]>();
  @Input() formDataId: string;
  @Input() disabledUpload: boolean;
  @Input() tooltipContent: string;
  @Input() title: string;
  @Input() uploadedFiles: string[] = [];
  @Input() uploadSuccessFull: boolean;
  selectedFiles: { file: any; fileName: string; fileType?: any }[] = [];
  selectedPreviewFileUrl: string;

  formData = new FormData();

  plusIconBlack: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.PlusIcon.name, 'small dark-gray')
  );

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );

  constructor(
    translateService: TranslateService,
    protected sanitizer: DomSanitizer,
    protected formBuilder: UntypedFormBuilder
  ) {
    super(translateService);

    this.formData.append('Id', this.formDataId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.uploadSuccessFull && changes.uploadSuccessFull.currentValue) {
      this.selectedFiles = [];
      this.formData = new FormData();
    }
  }

  onFileSelected(event) {
    if (event.target.files) {
      let uploadFiles = event.target.files;

      if (!uploadFiles || uploadFiles.length === 0) {
        return;
      }

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedFiles.push({
            file: e.target.result as string,
            fileName: file.name,
            fileType: file.type,
          });
        };
        reader.readAsDataURL(file);
        this.formData.append(`files_${file.name}`, file, file.name);
      }

      event.target.value = '';
    }
  }

  uploadPhotos() {
    const blobArray: Array<Blob> = [];

    this.formData.forEach((value, key) => {
      if (value instanceof Blob) {
        blobArray.push(value);
      }
    });

    this.fileUploaded.emit(blobArray);
  }

  removeFile(file: any) {
    let index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);

      this.formData.delete(`files_${file.fileName}`);
    }
  }

  removeUploadedFile(file: any) {
    let removedFiles = [file];
    this.removeFileEvent.emit(removedFiles);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
