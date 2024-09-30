export const environment = {
  production: true,
  envName: 'production',
  api_base_url_v1: 'https://surge-mobility-api.azurewebsites.net/',
  api_base_url_v2: '',
  api_base_url_v3: '',
  google_maps_api_key: 'AIzaSyAnfRDFxDd0BMVjaqlkBeVwmksmBDebvZA',
  azure_maps_api_key: 'ZWE0e9BizSQNY08k_Sjzp0Rhbary6AAe24mco4oJV44',
  azure_maps_api_base_url: 'https://atlas.microsoft.com',
  login_request_scopes: [
    'https://b2csurgemobility.onmicrosoft.com/67166558-fa84-476c-8f70-37cd116d85a8/charging-api',
    'openid',
    'profile',
    'offline_access',
  ],
  protected_resources_scopes: [
    'https://b2csurgemobility.onmicrosoft.com/67166558-fa84-476c-8f70-37cd116d85a8/charging-api',
  ],
  ad_b2c_signIn_signUp: 'B2C_1_SignUpSignInFlow',
  ad_b2c_signUp: 'B2C_1_SignUpOnlyFlow',
  ad_b2c_reset_password: 'B2C_1_ResetPasswordFlow',
  ad_b2c_signIn_signUp_authority:
    'https://b2csurgemobility.b2clogin.com/b2csurgemobility.onmicrosoft.com/B2C_1_SignUpSignInFlow',
  ad_b2c_signUp_authority:
    'https://b2csurgemobility.b2clogin.com/b2csurgemobility.onmicrosoft.com/B2C_1_SignUpOnlyFlow',
  ad_b2c_reset_password_authority:
    'https://b2csurgemobility.b2clogin.com/b2csurgemobility.onmicrosoft.com/B2C_1_ResetPasswordFlow',
  ad_b2c_signIn_signUp_authority_domain: 'b2csurgemobility.b2clogin.com',
  ad_b2c_client_id: '0af7050c-6df5-4f44-a7d1-34c713900d82',
  ad_b2c_redirect_url: 'https://plug.surgemobility.tech/oauth-token',
  stripe_public_key:
    'pk_live_51O89bgFBrrF2iLpfPoGKwmK5lwazaFiNBDZuiszIVJo5ehjH0VRNjzYYYEUgpNHO4vURJb5lMlh4A23oq5mJgr1100bMDtvEOQ',
  nomupaySuccessRedirectUrl:
    'https://plug.surgemobility.tech/settings?response=success',
  nomupayErrorRedirectUrl:
    'https://plug.surgemobility.tech/settings?response=error',
  x_application_client_id: null,
  signalr_url:
    'https://messaging-service-functions.azurewebsites.net/api/negotiate',
};
