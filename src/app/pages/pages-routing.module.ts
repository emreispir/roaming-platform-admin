import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../@core/services/msal.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '../@theme/layouts/main-layout/layout.component';
import { Policy } from '../@core/models/policy';
import { HomeComponent } from './home/home.component';
import { OauthTokenComponent } from './oauth-token/oauth-token/oauth-token.component';

const routes: Routes = [
  {
    path: 'oauth-token',
    children: [
      {
        path: '',
        component: OauthTokenComponent
      }
    ]
  },
  {
    path: 'home',
    children: [
      {
        path: '',
        component: HomeComponent
      }
    ]
  },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [MsalGuard],
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./account/profile/profile.component').then(
            m => m.ProfileComponent
          )
      }
    ]
  },
  {
    path: 'charge-points',
    canActivate: [MsalGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./charge-point/charge-point-routing.module').then(
        x => x.ChargePointRoutingModule
      )
  },
  {
    path: 'sessions',
    component: LayoutComponent,
    loadChildren: () =>
      import('./session/session-routing.module').then(
        x => x.SessionRoutingModule
      )
  },
  {
    path: 'transactions',
    component: LayoutComponent,
    loadChildren: () =>
      import('./transaction/transaction-routing.module').then(
        x => x.TransactionRoutingModule
      )
  },
  {
    path: 'connectors',
    data: {
      policies: [Policy.ConnectorManage]
    },
    canActivate: [MsalGuard],
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./connector/connector-list/connector-list.component').then(
            m => m.ConnectorListComponent
          ),
        data: {
          policies: [Policy.ConnectorManage]
        }
      }
    ]
  },
  {
    path: 'cards',
    component: LayoutComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./card/card-list/card-list.component').then(
            mod => mod.CardListComponent
          ),
        data: {
          policies: [Policy.CardRead]
        }
      }
    ]
  },
  {
    path: 'users',
    canActivate: [MsalGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./users/users-routing.module').then(x => x.UsersRoutingModule)
  },

  { path: '', redirectTo: '/oauth-token', pathMatch: 'full' },
  { path: '**', redirectTo: '/oauth-token' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}