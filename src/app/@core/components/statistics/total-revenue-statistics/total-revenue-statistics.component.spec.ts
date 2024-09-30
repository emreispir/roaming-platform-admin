import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalRevenueStatisticsComponent } from './total-revenue-statistics.component';

describe('TotalRevenueStatisticsComponent', () => {
  let component: TotalRevenueStatisticsComponent;
  let fixture: ComponentFixture<TotalRevenueStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalRevenueStatisticsComponent]
    });
    fixture = TestBed.createComponent(TotalRevenueStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
