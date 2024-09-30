import { NgModule } from '@angular/core';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [PagesRoutingModule, RouterModule, TranslateModule],
  declarations: [PagesComponent]
})
export class PagesModule {}
