import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Icons } from '../../../../assets/svg/svg-variables';
import { BaseComponent } from '../../../shared/base.component';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [TranslateModule, RouterModule, NgIf, QRCodeModule],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
})
export class QrCodeComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  qrData: string;
  title: string;
  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );

  constructor(
    protected translateService: TranslateService,
    public config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected sanitizer: DomSanitizer,
    protected cd: ChangeDetectorRef
  ) {
    super(translateService);

    this.title = this.config?.data?.title;
    this.qrData = this.config?.data?.qrData;
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
