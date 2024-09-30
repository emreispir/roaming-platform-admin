import {
  ChangeDetectorRef,
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { IconsArray } from '../../../../assets/svg/svg-variables';
import * as moment from 'moment';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-report-widget-card',
  templateUrl: './report-widget-card.component.html',
  styleUrls: ['./report-widget-card.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RouterModule,
    TranslateModule,
    MenuModule,
    TooltipModule,
    LoaderComponent,
    NgStyle
  ]
})
export class ReportWidgetCardComponent extends BaseComponent
  implements OnChanges, OnDestroy {
  @Input() headerTitle: string;
  @Input() navTitle: string;
  @Input() navRoute: string;
  @Input() queryParam: any;
  @Input() infoText: string;
  @Input() infoTextColor: string;
  @Input() bgColor: string;
  @Input() toolTipContent: string;
  @Input() loading: boolean;
  @Input() isHTMLContent: boolean = true;
  @Input() imgSrc: any;
  @Input() tags: TagResponse[];
  @Input() showRange: boolean;
  @Input() firstMenuDatas: any[];
  firstMenuItems: any[];
  selectedFirstMenuItem: any;
  selectedDateRange: any;

  @Output() dataRangeChanged = new EventEmitter<any>();
  @Output() firstMenuItemChanged = new EventEmitter<any>();

  infoIconSmall: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.InformationIcon.name,
      'small dark-blue filled-path',
      true
    )
  );

  constructor(
    protected translateService: TranslateService,
    protected router: Router,
    public activatedRoute: ActivatedRoute,
    protected sanitizer: DomSanitizer,
    protected cd: ChangeDetectorRef
  ) {
    super(translateService);
    this.selectedDateRange = {
      label: this.getTranslate('COMMON.MONTHLY'),
      startDate: moment()
        .subtract(1, 'months')
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      endDate: moment()
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    };
    this.generateMenuItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.firstMenuDatas && changes?.firstMenuDatas?.currentValue) {
      this.firstMenuDatas = changes?.firstMenuDatas?.currentValue;
      this.selectedFirstMenuItem = this.firstMenuDatas[0];
      this.generateFirstMenuItems();
    }
  }

  onChangeRange(range: any): void {
    let value = {
      range: range,
      item: this.selectedFirstMenuItem
    };
    this.dataRangeChanged.emit(value);
  }

  onChangeFirstMenuItem(item: any): void {
    let value = {
      range: this.selectedDateRange,
      item: item
    };
    this.firstMenuItemChanged.emit(value);
  }

  generateMenuItems(): any {
    return (this.menuItems = [
      {
        label: this.getTranslate('COMMON.DAILY'),
        command: () => {
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.DAILY'),
            startDate: moment()
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onChangeRange(this.selectedDateRange);
        }
      },
      {
        label: this.getTranslate('COMMON.WEEKLY'),
        command: () => {
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.WEEKLY'),
            startDate: moment()
              .subtract(7, 'day')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onChangeRange(this.selectedDateRange);
        }
      },
      {
        label: this.getTranslate('COMMON.MONTHLY'),
        command: () => {
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.MONTHLY'),
            startDate: moment()
              .startOf('month')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onChangeRange(this.selectedDateRange);
        }
      },
      {
        label: this.getTranslate('COMMON.LAST-THREE-MONTH'),
        command: () => {
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.LAST-THREE-MONTH'),
            startDate: moment()
              .subtract(3, 'months')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onChangeRange(this.selectedDateRange);
        }
      },
      {
        label: this.getTranslate('COMMON.YEARLY'),
        command: () => {
          this.selectedDateRange = {
            label: this.getTranslate('COMMON.YEARLY'),
            startDate: moment()
              .subtract(1, 'year')
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment()
              .endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
          this.onChangeRange(this.selectedDateRange);
        }
      }
    ]);
  }

  generateFirstMenuItems(): any {
    this.firstMenuItems = [];
    return this.firstMenuDatas.forEach(firstMenuData => {
      this.firstMenuItems.push({
        label: firstMenuData?.label,
        command: () => {
          this.selectedFirstMenuItem = firstMenuData;
          this.onChangeFirstMenuItem(this.selectedFirstMenuItem);
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
