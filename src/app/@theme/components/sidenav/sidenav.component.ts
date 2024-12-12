import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../shared/base.component';
import { RoleType } from '../../../@core/models/user';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { SharedService } from '../../../@core/services/shared.service';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { SidebarModule } from 'primeng/sidebar';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    NgClass,
    SidebarModule,
    NgTemplateOutlet
  ]
})
export class SidenavComponent extends BaseComponent
  implements OnInit, OnDestroy {
  sidebarVisible: boolean = true;
  display: Boolean = true;
  roleTypes = RoleType;
  cubeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CubeIcon.name, 'regular')
  );
  dashboardIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.DashboardIcon.name, 'regular')
  );
  chargePointIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.ChargePointIcon.name, 'regular')
  );
  sessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SessionIcon.name, 'regular')
  );
  transactionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.TransactionIcon.name, 'regular')
  );
  userIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.UserIcon.name, 'regular')
  );
  logoWithText: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.SurgeMobilityLogoWithText.name,
      'white filled-path',
      true
    )
  );
  logoWithoutText: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.SurgeMobilityLogoWithoutText.name,
      'white xlarge',
      true
    )
  );
  currentIcon: SafeHtml = this.logoWithText;

  constructor(
    protected sharedService: SharedService,
    protected translateService: TranslateService,
    protected router: Router,
    protected sanitizer: DomSanitizer,
    protected config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef
  ) {
    super(translateService);
  }

  @HostListener('window:resize', ['$event'])
  handleResize(event) {
    if (window.innerWidth < 1280) {
      this.currentIcon = this.logoWithoutText;
    } else {
      this.currentIcon = this.logoWithText;
    }
  }

  ngOnInit() {
    if (window.innerWidth < 1280) {
      this.currentIcon = this.logoWithoutText;
    } else {
      this.currentIcon = this.logoWithText;
    }

    this.subscription.add(
      this.sharedService?.sidebarVisible$.subscribe(visible => {
        this.sidebarVisible = visible;
      })
    );
  }

  sendNotification() {
    this.dialogConfig.data = {
      isChild: true
    };

    this.open(this.components.sendNotificationComponent);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
