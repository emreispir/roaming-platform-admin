import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '../../@core/services/msal.guard';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { TransactionDetailComponent } from './transaction-detail/transaction-detail.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [MsalGuard],
    component: TransactionListComponent
  },
  {
    path: ':id',
    canActivate: [MsalGuard],
    component: TransactionDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule {}
