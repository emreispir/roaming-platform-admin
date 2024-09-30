import { Component, Input, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  standalone: true
})
export class LoaderComponent extends BaseComponent implements OnDestroy {
  @Input() loaderMessage;

  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
