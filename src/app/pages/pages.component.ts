import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../shared/base.component';

@Component({
  selector: 'app-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <router-outlet></router-outlet>
  `,
})
export class PagesComponent extends BaseComponent {
  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
