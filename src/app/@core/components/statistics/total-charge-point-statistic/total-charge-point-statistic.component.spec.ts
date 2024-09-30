import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalChargePointStatisticComponent } from './total-charge-point-statistic.component';

describe('TotalChargePointStatisticComponent', () => {
  let component: TotalChargePointStatisticComponent;
  let fixture: ComponentFixture<TotalChargePointStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TotalChargePointStatisticComponent]
    });
    fixture = TestBed.createComponent(TotalChargePointStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
