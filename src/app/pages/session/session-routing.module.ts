import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { SessionDetailComponent } from './session-detail/session-detail.component';
import { SessionListComponent } from './session-list/session-list.component';
import { Policy } from '../../@core/models/policy';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: SessionListComponent,
    data: {
      policies: [Policy.ChargeSessionRead],
    },
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: SessionDetailComponent,
    data: {
      policies: [Policy.ChargeSessionRead],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionRoutingModule {}
