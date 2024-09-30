import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { SharedService } from '../../../@core/services/shared.service';
import { Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../../shared/base.component';
import { MenuItem } from 'primeng/api';
import { UserDetailsDto } from '../../../../../api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { NgIf } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SurgeAvatarComponent } from 'surge-components';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    BreadcrumbModule,
    SurgeAvatarComponent
  ]
})
export class HeaderComponent extends BaseComponent
  implements OnDestroy, AfterViewChecked {
  breadcrumbItems: MenuItem[];
  user: UserDetailsDto = this.sharedService?.userData;
  private destroy$: Subject<void> = new Subject<void>();

  infoIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.QuestionIcon.name,
      'medium dark-blue filled-path',
      true
    )
  );

  constructor(
    public sharedService: SharedService,
    protected translateService: TranslateService,
    protected router: Router,
    private sanitizer: DomSanitizer,
    protected cd: ChangeDetectorRef
  ) {
    super(translateService);

    this.subscription.add(
      this.sharedService.breadcrumbData.subscribe(t => {
        this.breadcrumbItems = t;
      })
    );

    this.subscription.add(
      this.sharedService.changedUser.subscribe(t => {
        this.user = t;
      })
    );
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
