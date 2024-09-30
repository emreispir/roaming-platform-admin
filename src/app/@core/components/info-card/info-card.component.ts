import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonOption } from '../../models/common';
import { BaseComponent } from '../../../shared/base.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  standalone: true,
  imports: [TranslateModule, NgIf, NgFor, DropdownModule]
})
export class InfoCardComponent extends BaseComponent implements OnDestroy {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() buttonOption: ButtonOption;
  @Input() headerOption: any;
  @Input() imgSrc: any;
  @Input() showSwitch: boolean;
  @Input() switchStatus: any;
  @Input() isCard: boolean;
  @Input() showDropdown: boolean;
  @Input() dropdownOptions: any;
  @Input() selectedDropdownOption: any;

  @Output() buttonClicked = new EventEmitter<void>();
  @Output() switchClicked = new EventEmitter<void>();
  @Output() dropdownSelectionChanged = new EventEmitter<void>();

  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  onButtonClick(): void {
    this.buttonClicked.emit();
  }

  toggleSwitch() {
    this.switchClicked.emit(this.switchStatus);
  }

  onDropdownSelectionChanged() {
    this.dropdownSelectionChanged.emit(this.selectedDropdownOption);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
