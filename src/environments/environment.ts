export const environment = {
  production: false,
  envName: 'development',
  api_base_url_v1: 'https://surge-mobility-api-dev.azurewebsites.net/',
  api_base_url_v2: '',
  api_base_url_v3: '',
  google_maps_api_key: 'AIzaSyAnfRDFxDd0BMVjaqlkBeVwmksmBDebvZA',
  azure_maps_api_key: 'ZWE0e9BizSQNY08k_Sjzp0Rhbary6AAe24mco4oJV44',
  azure_maps_api_base_url: 'https://atlas.microsoft.com',
  login_request_scopes: [
    'https://b2csurgemobilitydev.onmicrosoft.com/f670f1bc-9a52-43ea-99da-5eb22110d06c/charging-api',
    'openid',
    'profile',
    'offline_access',
  ],
  protected_resources_scopes: [
    'https://b2csurgemobilitydev.onmicrosoft.com/f670f1bc-9a52-43ea-99da-5eb22110d06c/charging-api',
  ],
  ad_b2c_signIn_signUp: 'B2C_1_SignUpSignInFlow',
  ad_b2c_signUp: 'B2C_1_SignUpOnlyFlow',
  ad_b2c_reset_password: 'B2C_1_ResetPasswordFlow',
  ad_b2c_signIn_signUp_authority:
    'https://b2csurgemobilitydev.b2clogin.com/b2csurgemobilitydev.onmicrosoft.com/B2C_1_SignUpSignInFlow',
  ad_b2c_signUp_authority:
    'https://b2csurgemobilitydev.b2clogin.com/b2csurgemobilitydev.onmicrosoft.com/B2C_1_SignUpOnlyFlow',
  ad_b2c_reset_password_authority:
    'https://b2csurgemobilitydev.b2clogin.com/b2csurgemobilitydev.onmicrosoft.com/B2C_1_ResetPasswordFlow',
  ad_b2c_signIn_signUp_authority_domain: 'b2csurgemobilitydev.b2clogin.com',
  ad_b2c_client_id: '07073542-67b3-47c1-8e32-64e8ddad6762',
  ad_b2c_redirect_url:
    'https://gray-river-0c7c74003-dev.westeurope.2.azurestaticapps.net/oauth-token',
  stripe_public_key:
    'pk_test_51O89bgFBrrF2iLpfjkXmlZbnMRSqd7yb8QirzspGZtqiuouJOakqCmCuMIHnP8mS8zdzFq5WEhLkPpTP9sfCllkZ00g7jlg4qb',
  nomupaySuccessRedirectUrl:
    'https://gray-river-0c7c74003-dev.westeurope.2.azurestaticapps.net/settings?response=success',
  nomupayErrorRedirectUrl:
    'https://gray-river-0c7c74003-dev.westeurope.2.azurestaticapps.net/settings?response=error',
  x_application_client_id: null,
  signalr_url:
    'https://messaging-service-functions-dev.azurewebsites.net/api/negotiate',
};
