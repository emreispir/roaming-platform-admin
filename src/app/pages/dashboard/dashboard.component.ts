import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../@core/services/shared.service';
import { NgIf } from '@angular/common';
import { ScrollableComponent } from '../../@core/components/scrollable/scrollable.component';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { HeaderPanelComponent } from '../../@core/components/header-panel/header-panel.component';
import { FormBuilder } from '@angular/forms';
import { ChargePointConnectorStartComponent } from '../charge-point/charge-point-connector-start/charge-point-connector-start.component';
import { Icons } from '../../../assets/svg/svg-variables';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule, RouterModule, HeaderPanelComponent]
})
export class DashboardComponent extends ScrollableComponent
  implements AfterViewChecked, OnDestroy {
  sessionIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.SessionIcon.name, 'regular')
  );

  constructor(
    public sharedService: SharedService,
    protected translateService: TranslateService,
    protected router: Router,
    private cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer,
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

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  init() {
    this.breadcrumbMenuItems = [
      { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
      {
        label: this.getTranslate('PAGES.DASHBOARD.TITLE'),
        routerLink: '/dashboard'
      }
    ];

    this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

    this.components = {
      connectorStart: ChargePointConnectorStartComponent
    };
  }

  startChargeConfirmation(connector: any) {
    this.dialogConfig.data = {
      isChild: true,
      confirmEventCallback: (eventData: any) => {
        this.close();
      },
      cancelEventCallback: (eventData: any) => {
        this.close();
      }
    };

    this.open(this.components.connectorStart);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
