import { registerLocaleData } from '@angular/common';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeEn from '@angular/common/locales/en';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { SharedService } from './@core/services/shared.service';
import { BaseComponent } from './shared/base.component';
import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Language } from './@core/models/common';
import { NotificationService } from './@core/services/notification.service';

@Component({
  selector: 'app-root',
  template: `
    <app-gpt></app-gpt>
    <div>
      <p-toast></p-toast>
      <app-loader *ngIf="loading"></app-loader>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent extends BaseComponent implements OnInit {
  constructor(
    protected translateService: TranslateService,
    protected router: Router,
    private config: PrimeNGConfig,
    translate: TranslateService,
    public sharedService: SharedService,
    protected notificationService: NotificationService
  ) {
    super(translate);

    translate.setDefaultLang(Language.EN);
    if (!sharedService.language) {
      sharedService.setLanguage(translate.getBrowserLang());
    }

    translate.addLangs([Language.EN, Language.TR]);
    translate.use(sharedService.language);
    registerLocaleData(localeEn, Language.EN, localeEnExtra);
    translate.get('primeng').subscribe(res => this.config.setTranslation(res));
  }

  ngOnInit() {
    this.router.events.subscribe(evt => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
