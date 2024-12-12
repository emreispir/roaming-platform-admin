import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/base.component';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../assets/svg/svg-variables';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../@core/services/shared.service';
import { LoaderComponent } from '../../@core/components/loader/loader.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    NgIf,
    FormsModule,
    CheckboxModule,
    LoaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent
  implements AfterViewChecked, OnDestroy {
  acceptAgreement: boolean;

  surgeMobilityLogoWithText: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.SurgeMobilityLogoWithText.name,
      'dark-blue filled-path',
      true
    )
  );

  /**
   *
   */
  constructor(
    public sharedService: SharedService,
    protected router: Router,
    protected translateService: TranslateService,
    private cd: ChangeDetectorRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
