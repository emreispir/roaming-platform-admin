import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { Policy } from '../../@core/models/policy';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: TransactionListComponent,
    data: {
      policies: [Policy.TransactionRead],
    },
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: TransactionDetailComponent,
    data: {
      policies: [Policy.TransactionRead],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}