import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { CampaignsService } from './api/campaigns.service';
import { CardsService } from './api/cards.service';
import { ChargePointInterestReviewsService } from './api/chargePointInterestReviews.service';
import { ChargePointInterestSessionsService } from './api/chargePointInterestSessions.service';
import { ChargePointInterestUserFavoritesService } from './api/chargePointInterestUserFavorites.service';
import { ChargePointInterestsService } from './api/chargePointInterests.service';
import { ChargePointsService } from './api/chargePoints.service';
import { ChargeSessionsService } from './api/chargeSessions.service';
import { CitiesService } from './api/cities.service';
import { ConnectorsService } from './api/connectors.service';
import { CountriesService } from './api/countries.service';
import { CouponsService } from './api/coupons.service';
import { CreditCardsService } from './api/creditCards.service';
import { CurrenciesService } from './api/currencies.service';
import { DevUtilsService } from './api/devUtils.service';
import { DeviceTokensService } from './api/deviceTokens.service';
import { DirectoriesService } from './api/directories.service';
import { DirectoryIntegrationsService } from './api/directoryIntegrations.service';
import { DistrictsService } from './api/districts.service';
import { IntegrationsService } from './api/integrations.service';
import { InvitationsService } from './api/invitations.service';
import { InvoiceRequestsService } from './api/invoiceRequests.service';
import { InvoicesService } from './api/invoices.service';
import { MemberBillingInfosService } from './api/memberBillingInfos.service';
import { NomuPayCallbackService } from './api/nomuPayCallback.service';
import { PaymentGatewayService } from './api/paymentGateway.service';
import { PoliciesService } from './api/policies.service';
import { ReportsService } from './api/reports.service';
import { ReservationsService } from './api/reservations.service';
import { ReviewsService } from './api/reviews.service';
import { RolesService } from './api/roles.service';
import { SiteHostsService } from './api/siteHosts.service';
import { SubscriptionPaymentsService } from './api/subscriptionPayments.service';
import { SubscriptionsService } from './api/subscriptions.service';
import { TariffsService } from './api/tariffs.service';
import { TransactionsService } from './api/transactions.service';
import { UserFavoritedChargePointsService } from './api/userFavoritedChargePoints.service';
import { UsersService } from './api/users.service';
import { VehiclesService } from './api/vehicles.service';
import { WorkspacesService } from './api/workspaces.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
