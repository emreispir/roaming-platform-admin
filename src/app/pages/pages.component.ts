import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../shared/base.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <router-outlet></router-outlet>
  `,
  standalone: true,
  imports: [TranslateModule, RouterModule]
})
export class PagesComponent extends BaseComponent {
  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
