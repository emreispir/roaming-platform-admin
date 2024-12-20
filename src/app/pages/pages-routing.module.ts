import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../@core/services/msal.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from '../@theme/layouts/main-layout/layout.component';
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
    path: 'sessions',
    canActivate: [MsalGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./session/session-routing.module').then(
        x => x.SessionRoutingModule
      )
  },

  {
    path: 'transactions',
    canActivate: [MsalGuard],
    component: LayoutComponent,
    loadChildren: () =>
      import('./transaction/transaction-routing.module').then(
        x => x.TransactionRoutingModule
      )
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

  { path: '', redirectTo: '/oauth-token', pathMatch: 'full' },
  { path: '**', redirectTo: '/oauth-token' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
