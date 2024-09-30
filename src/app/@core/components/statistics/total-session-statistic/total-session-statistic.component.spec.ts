import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSessionStatisticComponent } from './total-session-statistic.component';

describe('TotalSessionStatisticComponent', () => {
  let component: TotalSessionStatisticComponent;
  let fixture: ComponentFixture<TotalSessionStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TotalSessionStatisticComponent]
    });
    fixture = TestBed.createComponent(TotalSessionStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
