import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class NotificationService {
  config = {
    duration: 6000,
  };

  constructor(
    private translate: TranslateService,
    private messageService: MessageService
  ) {}

  showSuccessToast(message: string = null) {
    const title = this.translate.instant('COMMON.SUCCESS');
    message = message
      ? message
      : this.translate.instant('NOTIFICATIONS.PROCESS-SUCCEEDED');
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: this.config.duration,
      icon: 'pi pi-check text-success',
    });
  }

  showErrorToast(message: string = null) {
    const title = this.translate.instant('COMMON.ERROR');
    message = message
      ? message
      : this.translate.instant('NOTIFICATIONS.PROCESS-FAILED');
    this.messageService.add({
      severity: 'danger',
      summary: title,
      detail: message,
      life: this.config.duration,
      icon: 'pi pi-times-circle text-danger',
    });
  }

  showWarningToast(message: string) {
    const title = this.translate.instant('COMMON.WARNING');
    message = message
      ? message
      : this.translate.instant('NOTIFICATIONS.PROCESS-WARNING');
    this.messageService.add({
      severity: 'warning',
      summary: title,
      detail: message,
      life: this.config.duration,
      icon: 'pi pi-exclamation-triangle text-warning',
    });
  }

  showInformationToast(message: string) {
    const title = this.translate.instant('COMMON.INFO');
    message = message
      ? message
      : this.translate.instant('NOTIFICATIONS.PROCESS-INFO');
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: this.config.duration,
      icon: 'pi pi-info-circle text-primary',
    });
  }
}
