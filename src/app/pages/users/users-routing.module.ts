import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersDetailComponent } from './users-detail/users-detail.component';
import { MsalGuard } from '../../@core/services/msal.guard';
import { Policy } from '../../@core/models/policy';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: UsersListComponent,
    data: {
      policies: [Policy.UserRead],
    },
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: UsersDetailComponent,
    data: {
      policies: [Policy.UserRead],
    },
  },
  {
    path: ':id/:tabName',
    canActivate: [MsalGuard],
    component: UsersDetailComponent,
    data: {
      policies: [Policy.UserRead],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
