import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargePointConnectorStartComponent } from './charge-point-connector-start.component';

describe('ChargePointConnectorStartComponent', () => {
  let component: ChargePointConnectorStartComponent;
  let fixture: ComponentFixture<ChargePointConnectorStartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChargePointConnectorStartComponent]
    });
    fixture = TestBed.createComponent(ChargePointConnectorStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
