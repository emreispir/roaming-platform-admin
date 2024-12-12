import { Inject, Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import { Keys } from '../constants/keys';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subscription,
  catchError,
  mapTo,
  tap
} from 'rxjs';
import {
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalService
} from '@azure/msal-angular';
import {
  CurrenciesService,
  CurrencyDto,
  RoamingUserDetailDto
} from '../../../../api';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RedirectRequest } from '@azure/msal-browser';
import { JwtResponse } from '../models/common';
import jwt_decode from 'jwt-decode';

@Injectable()
export class SharedService implements OnDestroy {
  public userData: RoamingUserDetailDto;
  public userToken: string;

  public language: string;
  changedUser: ReplaySubject<any> = new ReplaySubject<1>();
  changedToken: ReplaySubject<any> = new ReplaySubject<1>();
  breadcrumbData: ReplaySubject<any> = new ReplaySubject<1>();
  selectedTabIndex = new BehaviorSubject<number>(0);

  sidebarVisible$ = new BehaviorSubject<boolean>(true);
  renderer: any;
  subscription: Subscription;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    protected translateService: TranslateService,
    protected router: Router,
    protected currecyService: CurrenciesService,
    protected rendererFactory: RendererFactory2
  ) {
    this.userData = JSON.parse(localStorage.getItem(Keys.USER_DATA));
    this.userToken = localStorage.getItem(Keys.USER_TOKEN);
    this.language = localStorage.getItem(Keys.LANGUAGE);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setUserToken(token: string) {
    localStorage.setItem(Keys.USER_TOKEN, token);
    this.userToken = localStorage.getItem(Keys.USER_TOKEN);
  }

  setUserData(data: RoamingUserDetailDto) {
    localStorage.setItem(Keys.USER_DATA, JSON.stringify(data));
    this.userData = JSON.parse(localStorage.getItem(Keys.USER_DATA));
  }

  changedUserToken(userToken: string) {
    this.changedToken.next(userToken);
    this.setUserToken(userToken);
  }

  changedUserData(userData: RoamingUserDetailDto) {
    this.changedUser.next(userData);
    this.setUserData(userData);
  }

  changedBreadcrumbData(items: any[]) {
    this.breadcrumbData.next(items);
  }

  changeSelectedTab(index: number) {
    this.selectedTabIndex.next(index);
  }

  setLanguage(language: string) {
    localStorage.setItem(Keys.LANGUAGE, language);
    this.language = localStorage.getItem(Keys.LANGUAGE);
    this.translateService.currentLang = language;
  }

  setCurrencies(): Observable<void> {
    return this.currecyService.currenciesGet().pipe(
      tap((v: CurrencyDto[]) => {
        localStorage.setItem(Keys.CURRENCIES, JSON.stringify(v));
      }),
      catchError(e => {
        throw e;
      }),
      mapTo(undefined)
    );
  }

  getCurrencies() {
    let currencies = localStorage.getItem(Keys.CURRENCIES);
    if (currencies) {
      let currenciesResponse = <CurrencyDto[]>JSON.parse(currencies);
      // TODO:
      // let userCurrency = currenciesResponse.find(
      //   c => c.id === this.getDecodedUserToken().extension_Directory?.currencyId
      // );
      // this.getDecodedUserToken().extension_Directory.currencyDto = userCurrency;
      return currenciesResponse;
    }

    return null;
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({
        ...this.msalGuardConfig.authRequest
      } as RedirectRequest);
    } else {
      this.authService.loginRedirect();
    }
  }

  toggleSidebarVisible() {
    this.sidebarVisible$.next(!this.sidebarVisible$.getValue());
    const body = document.getElementsByTagName('body')[0];

    if (!this.sidebarVisible$.getValue()) {
      this.renderer.addClass(body, 'minimize');
    } else {
      this.renderer.removeClass(body, 'minimize');
    }
  }

  async logOut(): Promise<void> {
    const logoutRequest = {
      postLogoutRedirectUri: environment.ad_b2c_redirect_url,
      onRedirectNavigate: (url: string): boolean => {
        return true;
      }
    };
    this.authService.logoutRedirect(logoutRequest);
    localStorage.removeItem(Keys.USER_DATA);
    localStorage.removeItem(Keys.USER_TOKEN);
    localStorage.removeItem(Keys.CURRENCIES);
  }

  ngOnDestroy() {
    this.sidebarVisible$.complete();
    this.changedUser.complete();
    this.changedToken.complete();
    this.breadcrumbData.complete();
    this.selectedTabIndex.complete();
    this.subscription.unsubscribe();
  }
}
