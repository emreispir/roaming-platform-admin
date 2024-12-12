import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { SessionListComponent } from './session-list/session-list.component';
import { SessionDetailComponent } from './session-detail/session-detail.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: SessionListComponent
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: SessionDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule {}
