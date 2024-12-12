import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionManualCompleteComponent } from './transaction-manual-complete.component';

describe('TransactionManualCompleteComponent', () => {
  let component: TransactionManualCompleteComponent;
  let fixture: ComponentFixture<TransactionManualCompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionManualCompleteComponent],
    });
    fixture = TestBed.createComponent(TransactionManualCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
