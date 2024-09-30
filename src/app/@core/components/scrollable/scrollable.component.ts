import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, debounceTime } from 'rxjs';
import { BaseComponent } from '../../../shared/base.component';

@Component({
  selector: 'app-scrollable',
  templateUrl: './scrollable.component.html',
  styleUrls: ['./scrollable.component.scss'],
  standalone: true
})
export class ScrollableComponent extends BaseComponent {
  @ViewChild('pageBody') pageBody: ElementRef;
  isScrolled = false;

  constructor(protected translateService: TranslateService) {
    super(translateService);
  }

  ngAfterViewInit() {
    const upperThresholdPercentage = 0.15;
    const lowerThresholdPercentage = 0.0125;

    this.subscription.add(
      fromEvent(this.pageBody.nativeElement, 'scroll')
        .pipe(debounceTime(100)) // Adjust this value as needed
        .subscribe(() => {
          const scrollTop = this.pageBody.nativeElement.scrollTop;
          const upperThreshold = upperThresholdPercentage * window.innerHeight;
          const lowerThreshold = lowerThresholdPercentage * window.innerHeight;

          const isScrollable =
            this.pageBody.nativeElement.scrollHeight >
            this.pageBody.nativeElement.clientHeight;

          if (isScrollable) {
            if (scrollTop > upperThreshold) {
              this.isScrolled = true;
            } else if (scrollTop < lowerThreshold) {
              this.isScrolled = false;
            }
          } else {
            this.isScrolled = true;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
