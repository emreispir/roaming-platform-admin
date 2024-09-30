import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalTransactionStatisticComponent } from './total-transaction-statistic.component';

describe('TotalTransactionStatisticComponent', () => {
  let component: TotalTransactionStatisticComponent;
  let fixture: ComponentFixture<TotalTransactionStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TotalTransactionStatisticComponent]
    });
    fixture = TestBed.createComponent(TotalTransactionStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
