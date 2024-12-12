import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { ChargePointListComponent } from './charge-point-list/charge-point-list.component';
import { ChargePointDetailComponent } from './charge-point-detail/charge-point-detail.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: ChargePointListComponent
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: ChargePointDetailComponent
  },
  {
    path: ':id/:tabName',
    canActivate: [MsalGuard],
    component: ChargePointDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargePointRoutingModule {}
