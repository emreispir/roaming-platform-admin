import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';

registerLocaleData(localeTr);
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule
} from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServicesModule } from './@core/services/services.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';
import {
  MsalInterceptorConfiguration,
  MsalModule,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration,
  MsalRedirectComponent
} from '@azure/msal-angular';

import { protectedResources, loginRequest, msalConfig } from '../auth-config';
import { ApiModule, Configuration, ConfigurationParameters } from '../../api';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './auth-interceptor';
import { TourNgxBootstrapModule } from 'ngx-ui-tour-ngx-bootstrap';
import { GptComponent } from './@core/components/gpt/gpt.component';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './@core/components/loader/loader.component';
import { DialogModule } from 'primeng/dialog';

const isIframe = window !== window.parent && !window.opener;

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initTranslation(translateService: TranslateService) {
  return () => {
    return new Promise<void>(resolve => {
      translateService.onLangChange.subscribe(() => {
        resolve();
      });
      translateService.use(translateService.getBrowserLang());
    });
  };
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    protectedResources.surgeApi.endpoint,
    protectedResources.surgeApi.scopes
  );
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.api_base_url_v1
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    HttpClientModule,
    ApiModule.forRoot(apiConfigFactory),
    ServicesModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),

    MsalModule,
    AppRoutingModule,
    TourNgxBootstrapModule,
    GptComponent,
    ToastModule,
    RouterModule,
    LoaderComponent,
    DialogModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslation,
      deps: [TranslateService],
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule {}
