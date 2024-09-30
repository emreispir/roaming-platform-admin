import { Component, OnDestroy, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';

@Component({
  selector: 'app-gpt',
  standalone: true,
  imports: [ButtonModule, NgIf, TranslateModule],
  templateUrl: './gpt.component.html',
  styleUrls: ['./gpt.component.scss'],
})
export class GptComponent extends BaseComponent implements OnDestroy {
  showChat = signal<boolean>(false);
  SurgeMobilityLogoWithoutText: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray['SurgeMobilityLogoWithoutText'].name,
      'medium white filled-path',
      true
    )
  );

  constructor(
    protected sanitizer: DomSanitizer,
    translateService: TranslateService
  ) {
    super(translateService);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
