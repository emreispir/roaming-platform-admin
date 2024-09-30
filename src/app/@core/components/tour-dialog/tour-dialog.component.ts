import { Component, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TourNgxBootstrapModule, TourService } from 'ngx-ui-tour-ngx-bootstrap';
import { INgxbStepOption } from 'ngx-ui-tour-ngx-bootstrap/lib/step-option.interface';
import { Icons, IconsArray } from '../../../../assets/svg/svg-variables';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tour-dialog',
  templateUrl: './tour-dialog.component.html',
  styleUrls: ['./tour-dialog.component.scss'],
  standalone: true,
  imports: [TranslateModule, NgIf, ButtonModule, TourNgxBootstrapModule]
})
export class TourDialogComponent extends BaseComponent implements OnDestroy {
  @Input() step: INgxbStepOption;

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );
  surgeLogo: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.SurgeMobilityLogoWithText.name,
      'dark-blue filled-path',
      true
    )
  );

  constructor(
    protected tourService: TourService,
    protected translateService: TranslateService,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  onEndTour(): void {
    this.tourService.end();
  }

  onNextStep(): void {
    this.tourService.next();
  }

  onPreviousStep(): void {
    this.tourService.prev();
  }

  hasNext(): boolean {
    return this.tourService.hasNext(this.step);
  }

  hasPrevious(): boolean {
    return this.tourService.hasPrev(this.step);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
