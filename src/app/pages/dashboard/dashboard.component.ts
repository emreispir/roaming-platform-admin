import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../@core/services/shared.service';
import { UserDetailsDto } from '../../../../api';
import { NgIf } from '@angular/common';
import { ScrollableComponent } from '../../@core/components/scrollable/scrollable.component';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef
} from 'primeng/dynamicdialog';
import { HeaderPanelComponent } from '../../@core/components/header-panel/header-panel.component';
import { FormBuilder } from '@angular/forms';
import { SurgeFormComponent } from 'surge-components';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
import { OtpVerificationComponent } from '../account/otp-verification/otp-verification.component';
import { InfoCardComponent } from '../../@core/components/info-card/info-card.component';
import { Keys } from '../../@core/constants/keys';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    RouterModule,
    HeaderPanelComponent,
    SurgeFormComponent,
    LoaderComponent,
    OtpVerificationComponent,
    InfoCardComponent
  ]
})
export class DashboardComponent extends ScrollableComponent
  implements AfterViewChecked, OnDestroy {
  @Input() directoryId: string;

  userResponse: UserDetailsDto;

  constructor(
    public sharedService: SharedService,
    protected translateService: TranslateService,
    protected router: Router,
    private cd: ChangeDetectorRef,
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
    this.directoryId = this.getDecodedUserToken()?.extension_DirectoryId
      ? this.getDecodedUserToken()?.extension_DirectoryId
      : null;

    this.breadcrumbMenuItems = [
      { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
      {
        label: this.getDecodedUserToken()?.extension_Directory?.name,
        routerLink: '/dashboard'
      },
      {
        label: this.getTranslate('PAGES.DASHBOARD.TITLE'),
        routerLink: '/dashboard'
      }
    ];

    this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);

    let userResponse = localStorage.getItem(Keys.AUTHENTICATED_USER_DATA);
    this.userResponse = userResponse ? JSON.parse(userResponse) : null;
  }

  navigateUserDetail() {
    this.router.navigate(['/users', this.userResponse?.id]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
