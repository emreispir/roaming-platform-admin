import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestTransactionListComponent } from './latest-transaction-list.component';

describe('LatestTransactionListComponent', () => {
  let component: LatestTransactionListComponent;
  let fixture: ComponentFixture<LatestTransactionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LatestTransactionListComponent]
    });
    fixture = TestBed.createComponent(LatestTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
