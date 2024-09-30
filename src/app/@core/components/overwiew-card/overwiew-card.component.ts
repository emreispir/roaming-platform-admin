import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TagResponse } from '../../models/common';
import { BaseComponent } from '../../../shared/base.component';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { TooltipModule } from 'primeng/tooltip';
import { SurgeAvatarComponent } from 'surge-components';
import { NgIf, NgFor } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-overwiew-card',
  templateUrl: './overwiew-card.component.html',
  styleUrls: ['./overwiew-card.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    NgFor,
    TooltipModule,
    SurgeAvatarComponent,
    RouterModule,
    LoaderComponent,
    RatingComponent,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OverwiewCardComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() headerTitle: string;
  @Input() toolTipContent: string;
  @Input() navTitle: string;
  @Input() navRoute: string;
  @Input() title: string;
  @Input() infoTextRoute: string;
  @Input() subTitle: string;
  @Input() infoImgSrc: any;
  @Input() infoText: any;
  @Input() subInfoText: string;
  @Input() rate: any;
  @Input() tags: TagResponse[];
  @Input() infoDescription: string;
  @Input() description: string;
  @Input() detailInfoImgSrc: any;
  @Input() detailInfoText: string;
  @Input() detailSubInfoText: string;
  @Input() loading: boolean;
  @Input() noReviewImgSrc: any;

  @Output() buttonClicked = new EventEmitter<void>();

  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );

  constructor(
    protected translateService: TranslateService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);

    this.myForm = this.formBuilder.group({
      rating: [this.rate, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.rate) {
      this.myForm.patchValue({ rating: this.rate });
    }
  }

  onButtonClick(): void {
    this.buttonClicked.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
