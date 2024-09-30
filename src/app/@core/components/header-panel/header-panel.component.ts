import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonOption, TagResponse } from '../../../@core/models/common';
import { BaseComponent } from '../../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import { NgFor, NgIf } from '@angular/common';
import { SurgeAvatarComponent } from 'surge-components';

@Component({
  selector: 'app-header-panel',
  templateUrl: './header-panel.component.html',
  styleUrls: ['./header-panel.component.scss'],
  standalone: true,
  imports: [TranslateModule, NgIf, NgFor, SurgeAvatarComponent]
})
export class HeaderPanelComponent extends BaseComponent implements OnDestroy {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() toolTipContent: string;
  @Input() tags: TagResponse[];
  @Input() showAvatar: boolean;
  @Input() avatarSrc: any;
  @Input() showButton: boolean;
  @Input() buttonOption: ButtonOption;
  @Input() showSecondaryButton: boolean;
  @Input() secondaryButtonOption: ButtonOption;

  @Output() buttonClicked = new EventEmitter<void>();
  @Output() secondaryButtonClicked = new EventEmitter<void>();

  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'medium dark-blue filled-path',
      true
    )
  );

  get showSubtitle(): boolean {
    return !!this.subtitle;
  }

  get showTags(): boolean {
    return !!this.tags && this.tags.length > 0;
  }

  constructor(
    protected translateService: TranslateService,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
  }

  onButtonClick(): void {
    this.buttonClicked.emit();
  }

  onSecondaryButtonClick(): void {
    this.secondaryButtonClicked.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
