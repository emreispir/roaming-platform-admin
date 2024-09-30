import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../../shared/base.component';
import { ButtonOption } from '../../models/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss'],
  standalone: true,
  imports: [TranslateModule, NgIf]
})
export class InfoPanelComponent extends BaseComponent implements OnDestroy {
  @Input() imageUrl!: any;
  @Input() title!: string;
  @Input() description!: string;
  @Input() showButton: boolean;
  @Input() buttonOption: ButtonOption;
  @Input() showSecondaryButton: boolean;
  @Input() secondaryButtonOption: ButtonOption;

  @Output() buttonClicked = new EventEmitter<void>();
  @Output() secondaryButtonClicked = new EventEmitter<void>();

  constructor(protected translateService: TranslateService) {
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
