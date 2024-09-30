import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { ChargePointDetailComponent } from './charge-point-detail/charge-point-detail.component';
import { ChargePointListComponent } from './charge-point-list/charge-point-list.component';
import { Policy } from '../../@core/models/policy';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: ChargePointListComponent,
    data: {
      policies: [Policy.ChargePointRead]
    }
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: ChargePointDetailComponent,
    data: {
      policies: [Policy.ChargePointRead]
    }
  },
  {
    path: ':id/:tabName',
    canActivate: [MsalGuard],
    component: ChargePointDetailComponent,
    data: {
      policies: [Policy.ChargePointRead]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargePointRoutingModule {}
