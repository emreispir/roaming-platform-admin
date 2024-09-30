import {
  LogLevel,
  Configuration,
  BrowserCacheLocation,
} from '@azure/msal-browser';
import { environment } from './environments/environment';

// this checks if the app is running on IE
export const isIE =
  window.navigator.userAgent.indexOf('MSIE ') > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1;

export const b2cPolicies = {
  names: {
    signUpSignIn: environment.ad_b2c_signIn_signUp,
    signUp: environment.ad_b2c_signUp,
    resetPassword: environment.ad_b2c_reset_password,
  },
  authorities: {
    signUpSignIn: {
      authority: environment.ad_b2c_signIn_signUp_authority,
    },
    signUp: {
      authority: environment.ad_b2c_signUp_authority,
    },
  },
  authorityDomain: environment.ad_b2c_signIn_signUp_authority_domain,
};

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.ad_b2c_client_id,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: environment.ad_b2c_redirect_url,
    postLogoutRedirectUri: environment.ad_b2c_redirect_url,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: isIE,
  },
};

export const protectedResources = {
  surgeApi: {
    endpoint: environment.api_base_url_v1,
    scopes: environment.protected_resources_scopes,
  },
};

export const loginRequest: {
  scopes: string[];
  redirectUri: string;
  redirectStartPage: string;
} = {
  scopes: environment.login_request_scopes,
  redirectUri: environment.ad_b2c_redirect_url,
  redirectStartPage: environment.ad_b2c_redirect_url,
};
