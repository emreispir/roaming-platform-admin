import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../@core/services/shared.service';
import { NotificationService } from '../../../@core/services/notification.service';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';
import { Language } from '../../../@core/models/common';
import { Keys } from '../../../@core/constants/keys';
import { NgIf } from '@angular/common';
import { HelperService } from '../../../@core/services/helper.service';
import { UsersService } from '../../../../../api/api/users.service';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { Policy } from '../../../@core/models/policy';
import { ScrollableComponent } from '../../../@core/components/scrollable/scrollable.component';
import { LoaderComponent } from '../../../@core/components/loader/loader.component';
import { HeaderPanelComponent } from '../../../@core/components/header-panel/header-panel.component';
import { InfoCardComponent } from '../../../@core/components/info-card/info-card.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    ProfileEditComponent,
    TranslateModule,
    LoaderComponent,
    HeaderPanelComponent,
    InfoCardComponent,
    MenuModule,
    NgIf
  ]
})
export class ProfileComponent extends ScrollableComponent
  implements AfterViewInit, OnDestroy {
  @ViewChildren('sectionContainer') sectionContainers!: QueryList<ElementRef>;

  noUserIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(IconsArray.NoUserIcon.name, 'xxlarge', true)
  );

  selectedLanguage = localStorage.getItem(Keys.LANGUAGE);
  languageOptions = [
    {
      label: this.getTranslate('LANGUAGES.en'),
      value: Language.EN
    },
    {
      label: this.getTranslate('LANGUAGES.tr'),
      value: Language.TR
    }
  ];

  constructor(
    protected helperService: HelperService,
    protected userService: UsersService,
    protected notificationService: NotificationService,
    protected router: Router,
    protected translateService: TranslateService,
    public sharedService: SharedService,
    protected sanitizer: DomSanitizer,
    protected dialogService: DialogService
  ) {
    super(translateService);
    this.init();
  }

  ngAfterViewInit() {
    this.breadcrumbMenuItems = [
      { label: this.getTranslate('SURGE'), routerLink: '/dashboard' },
      {
        label: this.getDecodedUserToken()?.extension_Directory?.name,
        routerLink: '/dashboard'
      },
      {
        label: this.getTranslate('COMMON.PROFILE'),
        routerLink: '/profile'
      }
    ];

    this.sharedService.changedBreadcrumbData(this.breadcrumbMenuItems);
    super.ngAfterViewInit();
  }

  init() {
    this.menuItems = [
      {
        label: this.getTranslate('COMMON.PROFILE'),
        icon: 'icon-system-user',
        command: () =>
          this.scrollToSection('profileEditSection', this.sectionContainers)
      },
      {
        label: this.getTranslate('PAGES.PROFILE.LANGUAGE-SETTING'),
        icon: 'icon-language',
        command: () =>
          this.scrollToSection('changeLanguageSection', this.sectionContainers)
      }
    ];
  }

  onLanguageSelectionChanged(selectedLanguage: string) {
    this.selectedLanguage = selectedLanguage;
  }

  changeLanguage() {
    this.translateService.use(this.selectedLanguage);
    this.sharedService.setLanguage(this.selectedLanguage);
    window.location.reload();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
