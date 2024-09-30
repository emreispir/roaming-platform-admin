import { NgModule } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { MsalGuard } from './msal.guard';
import { HelperService } from './helper.service';
import { NotificationService } from './notification.service';
import { SharedService } from './shared.service';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { BaseService } from './base.service';
import { SignalRService } from './signalr.service';

@NgModule({
  providers: [
    SharedService,
    MsalService,
    MsalBroadcastService,
    NotificationService,
    MessageService,
    HelperService,
    BaseService,
    MsalGuard,
    DynamicDialogRef,
    DynamicDialogConfig,
    DialogService,
    SignalRService,
  ],
})
export class ServicesModule {}
