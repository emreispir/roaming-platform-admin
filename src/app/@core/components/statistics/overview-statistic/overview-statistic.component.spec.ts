import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewStatisticComponent } from './overview-statistic.component';

describe('OverviewStatisticComponent', () => {
  let component: OverviewStatisticComponent;
  let fixture: ComponentFixture<OverviewStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverviewStatisticComponent]
    });
    fixture = TestBed.createComponent(OverviewStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
