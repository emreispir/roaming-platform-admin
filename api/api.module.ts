import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { CurrenciesService } from './api/currencies.service';
import { RoamingInvoicesService } from './api/roamingInvoices.service';
import { RoamingPointsService } from './api/roamingPoints.service';
import { RoamingSessionsService } from './api/roamingSessions.service';
import { RoamingTariffsService } from './api/roamingTariffs.service';
import { RoamingTransactionsService } from './api/roamingTransactions.service';
import { RoamingUsersService } from './api/roamingUsers.service';

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
