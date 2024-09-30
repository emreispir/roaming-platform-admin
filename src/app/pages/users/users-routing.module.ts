import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersDetailComponent } from './users-detail/users-detail.component';
import { MsalGuard } from '../../@core/services/msal.guard';
import { Policy } from '../../@core/models/policy';

const routes: Routes = [
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: UsersDetailComponent,
    data: {
      policies: [Policy.UserRead]
    }
  },
  {
    path: ':id/:tabName',
    canActivate: [MsalGuard],
    component: UsersDetailComponent,
    data: {
      policies: [Policy.UserRead]
    }
  },

  { path: '', redirectTo: '/oauth-token', pathMatch: 'full' },
  { path: '**', redirectTo: '/oauth-token' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
