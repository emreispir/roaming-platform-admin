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
  CountriesService,
  CountryDto,
  CurrenciesService,
  CurrencyDto,
  GetUserRolesResponse,
  RoleDto,
  RolesService,
  UserDetailsDto
} from '../../../../api';
import { b2cPolicies } from '../../../auth-config';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RedirectRequest } from '@azure/msal-browser';
import { SignalRService } from './signalr.service';
import { JwtResponse } from '../models/common';
import jwt_decode from 'jwt-decode';

@Injectable()
export class SharedService implements OnDestroy {
  public userData: UserDetailsDto;
  public userRolesData: GetUserRolesResponse;
  public userPoliciesData: string[];
  public userToken: string;
  public userId: string;
  public language: string;
  changedUserRoles: ReplaySubject<any> = new ReplaySubject<1>();
  changedUser: ReplaySubject<any> = new ReplaySubject<1>();
  changedToken: ReplaySubject<any> = new ReplaySubject<1>();
  breadcrumbData: ReplaySubject<any> = new ReplaySubject<1>();
  selectedTabIndex = new BehaviorSubject<number>(0);
  private workspaceNameSource = new BehaviorSubject<string>(
    localStorage.getItem('workspaceName') || ''
  );
  workspaceName$ = this.workspaceNameSource.asObservable();

  sidebarVisible$ = new BehaviorSubject<boolean>(true);
  renderer: any;
  subscription: Subscription;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    protected translateService: TranslateService,
    protected router: Router,
    private signalRService: SignalRService,
    protected currecyService: CurrenciesService,
    protected countryService: CountriesService,
    protected roleService: RolesService,
    protected rendererFactory: RendererFactory2
  ) {
    this.userData = JSON.parse(localStorage.getItem(Keys.USER_DATA));
    this.userRolesData = JSON.parse(localStorage.getItem(Keys.USER_ROLES_DATA));
    this.userToken = localStorage.getItem(Keys.USER_TOKEN);
    this.language = localStorage.getItem(Keys.LANGUAGE);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setUserToken(token: string) {
    localStorage.setItem(Keys.USER_TOKEN, token);
    this.userToken = localStorage.getItem(Keys.USER_TOKEN);
  }

  setUserData(data: UserDetailsDto) {
    localStorage.setItem(Keys.USER_DATA, JSON.stringify(data));
    this.userData = JSON.parse(localStorage.getItem(Keys.USER_DATA));
  }

  setUserRolesData(data: GetUserRolesResponse) {
    localStorage.setItem(Keys.USER_ROLES_DATA, JSON.stringify(data));
    this.userRolesData = JSON.parse(localStorage.getItem(Keys.USER_ROLES_DATA));
  }

  setUserPoliciesData(data: string[]) {
    localStorage.setItem(Keys.USER_POLICIES_DATA, JSON.stringify(data));
    this.userPoliciesData = JSON.parse(
      localStorage.getItem(Keys.USER_POLICIES_DATA)
    );
  }

  changedUserToken(userToken: string) {
    this.changedToken.next(userToken);
    this.setUserToken(userToken);
  }

  changedUserData(userData: UserDetailsDto) {
    this.changedUser.next(userData);
    this.setUserData(userData);
  }

  changedUserRolesData(userRolesData: GetUserRolesResponse) {
    this.changedUserRoles.next(userRolesData);
    this.setUserRolesData(userRolesData);
  }

  setWorkspaceName(workspaceName: string) {
    this.workspaceNameSource.next(workspaceName);
    localStorage.setItem('workspaceName', workspaceName);
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

  setRoles(): Observable<void> {
    return this.roleService.rolesGet().pipe(
      tap(v => {
        localStorage.setItem(Keys.ROLES, JSON.stringify(v.items));
      }),
      catchError(e => {
        throw e;
      }),
      mapTo(undefined)
    );
  }

  getRoles() {
    let roles = localStorage.getItem(Keys.ROLES);
    if (roles) {
      return <RoleDto[]>JSON.parse(roles);
    }

    return null;
  }

  setCountries(): Observable<void> {
    return this.countryService.countriesGet().pipe(
      tap(v => {
        localStorage.setItem(Keys.COUNTRIES, JSON.stringify(v));
      }),
      catchError(e => {
        throw e;
      }),
      mapTo(undefined)
    );
  }

  getCountries() {
    let countries = localStorage.getItem(Keys.COUNTRIES);
    if (countries) {
      return <CountryDto[]>JSON.parse(countries);
    }

    return null;
  }

  setCurrencies(): Observable<void> {
    return this.currecyService.currenciesGet().pipe(
      tap(v => {
        localStorage.setItem(Keys.CURRENCIES, JSON.stringify(v));
        this.getDecodedUserToken().extension_Directory.currencyDto = v.find(
          c =>
            c.id === this.getDecodedUserToken().extension_Directory?.currencyId
        );
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
      let userCurrency = currenciesResponse.find(
        c => c.id === this.getDecodedUserToken().extension_Directory?.currencyId
      );
      this.getDecodedUserToken().extension_Directory.currencyDto = userCurrency;

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

  register() {
    this.authService.loginRedirect({
      authority: b2cPolicies.authorities.signUp.authority,
      scopes: environment.login_request_scopes
    });
  }

  getDecodedUserToken(jwt?: string): JwtResponse {
    let jwtDecodedResponse: JwtResponse = null;
    let jwtBase: any = jwt_decode(
      jwt ? jwt : localStorage.getItem(Keys.USER_TOKEN)
    );

    jwtDecodedResponse = {
      ...jwtBase
    };

    if (jwtBase && this.userRolesData) {
      let activeDirectory = this.userRolesData?.userRoles?.find(
        x => x.directoryId === jwtBase.extension_DirectoryId
      );

      let currencies: CurrencyDto[] = [];
      if (activeDirectory.directory) {
        if (localStorage.getItem(Keys.CURRENCIES)) {
          currencies = JSON.parse(localStorage.getItem(Keys.CURRENCIES));
          activeDirectory.directory.currencyDto = currencies.find(
            c => c.id === activeDirectory.directory.currencyId
          );
        }
      }

      jwtDecodedResponse = {
        ...jwtBase,
        extension_DirectoryId: jwtBase?.extension_DirectoryId
          ? jwtBase.extension_DirectoryId
          : null,
        extension_Directory: activeDirectory
          ? activeDirectory?.directory
          : null,
        extension_Role: activeDirectory?.role ? activeDirectory?.role : null
      };

      jwtDecodedResponse.extension_Directory.currencyDto = currencies.find(
        c => c.id === activeDirectory.directory.currencyId
      );
    }

    return jwtDecodedResponse;
  }

  unsubscribeToSignalR() {
    if (!this.subscription) {
      this.subscription = new Subscription();
    }

    this.subscription.add(
      this.signalRService
        .invokeData(
          'unsubscribe',
          this.getDecodedUserToken()?.extension_DirectoryId,
          this.userData?.id
        )
        .subscribe({
          next: v => {
            this.signalRService.stopConnection();
          },
          error: e => {
            console.error('Error while unsubscribing from SignalR:', e);
          },
          complete: () => {}
        })
    );
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
    await this.unsubscribeToSignalR();

    const logoutRequest = {
      postLogoutRedirectUri: environment.ad_b2c_redirect_url,
      onRedirectNavigate: (url: string): boolean => {
        return true;
      }
    };

    this.authService.logoutRedirect(logoutRequest);

    localStorage.removeItem(Keys.USER_DATA);
    localStorage.removeItem(Keys.USER_ROLES_DATA);
    localStorage.removeItem(Keys.USER_TOKEN);
    localStorage.removeItem(Keys.USER_POLICIES_DATA);
    localStorage.removeItem(Keys.COUNTRIES);
    localStorage.removeItem(Keys.CURRENCIES);
    localStorage.removeItem(Keys.ROLES);
    localStorage.removeItem('workspaceName');
  }

  ngOnDestroy() {
    this.sidebarVisible$.complete();
    this.changedUserRoles.complete();
    this.changedUser.complete();
    this.changedToken.complete();
    this.breadcrumbData.complete();
    this.selectedTabIndex.complete();
    this.workspaceNameSource.complete();
    this.subscription.unsubscribe();
  }
}
