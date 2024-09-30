import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../../shared/base.component';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import {
  DynamicDialogConfig,
  DialogService,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Icons, IconsArray } from '../../../assets/svg/svg-variables';
import { HelperService } from '../services/helper.service';
import { NotificationService } from '../services/notification.service';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import * as moment from 'moment';

@Component({
  selector: 'app-export-file',
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    CalendarModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './export-file.component.html',
  styleUrls: ['./export-file.component.scss'],
})
export class ExportFileComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Output() confirmEvent = new EventEmitter<any>();
  confirmEventCallback: (eventData: any) => void;

  private destroy$: Subject<void> = new Subject<void>();
  calendarSubscription: Subscription;
  @ViewChild('calendar') datePicker;

  closeIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(Icons.CloseIcon.name, 'medium dark-gray')
  );
  downloadIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    this.getIconWithClass(
      IconsArray.DownloadIcon.name,
      'xxxlarge dark-blue filled-path',
      true
    )
  );

  minDate = moment()
    .subtract(1, 'year')
    .toDate();
  maxDate = moment().toDate();

  constructor(
    protected translateService: TranslateService,
    protected notificationService: NotificationService,
    protected helperService: HelperService,
    protected formBuilder: UntypedFormBuilder,
    public config: DynamicDialogConfig,
    protected dialogService: DialogService,
    protected dialogRef: DynamicDialogRef,
    protected sanitizer: DomSanitizer
  ) {
    super(translateService);
    this.init();
  }

  init() {
    this.myForm = this.formBuilder.group({
      rangeDate: [
        [
          moment()
            .subtract(2, 'days')
            .toDate(),
          moment().toDate(),
        ],
        Validators.required,
      ],
    });
  }

  ngOnDestroy() {
    if (this.calendarSubscription) {
      this.calendarSubscription.unsubscribe();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.confirmEventCallback = this.config?.data?.confirmEventCallback;
    this.confirmEvent.subscribe(this.confirmEventCallback);

    this.calendarSubscription = this.myForm
      .get('rangeDate')
      .valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((date) => {
        if (date) {
          if (date[0] && date[1]) {
            this.myForm.patchValue(
              {
                rangeDate: date,
              },
              { emitEvent: false }
            );

            this.datePicker.overlayVisible = false;
            this.submitted = false;
          }
        }
      });
  }

  exportFile() {
    this.buttonLoading = true;
    if (this.config?.data?.exportRangeDataRequired) {
      this.submitted = true;
      let formValues = this.myForm?.value;

      if (formValues.rangeDate) {
        if (formValues?.rangeDate[0] && formValues?.rangeDate[1]) {
          let data = {
            startDate: moment(formValues?.rangeDate[0])
              ?.startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            endDate: moment(formValues?.rangeDate[1])
              ?.endOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          };

          this.confirmEvent.emit(data);
        } else {
          this.buttonLoading = false;
        }
      } else {
        this.buttonLoading = false;
      }
    } else {
      this.confirmEvent.emit();
    }
  }
}
