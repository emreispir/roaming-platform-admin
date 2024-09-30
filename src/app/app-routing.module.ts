import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { BrowserUtils } from '@azure/msal-browser';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/pages-routing.module').then(m => m.PagesRoutingModule)
  },
  { path: '**', redirectTo: '' }
];

const config: ExtraOptions = {
  useHash: false,
  initialNavigation:
    !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
      ? 'enabledNonBlocking'
      : 'disabled'
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
