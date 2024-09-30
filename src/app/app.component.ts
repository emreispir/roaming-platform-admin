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
import { SignalRService } from './@core/services/signalr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends BaseComponent implements OnInit {
  constructor(
    protected signalRService: SignalRService,
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

    if (this.sharedService?.userData && !this.signalRService.connectionExists) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      if (!this.signalRService.isConnected()) {
        this.subscription.add(
          this.signalRService.connectHub().subscribe(connected => {
            if (connected) {
              this.subscribeToSignalrData();
            } else {
              console.error('SignalR connection could not be established.');
            }
          })
        );
      } else {
        this.subscribeToSignalrData();
      }
    }
  }

  subscribeToSignalrData() {
    this.subscription.add(
      this.signalRService
        .invokeData(
          'subscribe',
          `${
            this.getDecodedUserToken()?.extension_DirectoryId
          }/directory-admin`,
          this.sharedService?.userData?.id
        )
        .subscribe({
          next: v => {},
          error: e => {
            console.error('Failed to receive data:', e);
          },
          complete: () => {}
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
