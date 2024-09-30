import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalEnergyStatisticsComponent } from './total-energy-statistics.component';

describe('TotalEnergyStatisticsComponent', () => {
  let component: TotalEnergyStatisticsComponent;
  let fixture: ComponentFixture<TotalEnergyStatisticsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalEnergyStatisticsComponent]
    });
    fixture = TestBed.createComponent(TotalEnergyStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
