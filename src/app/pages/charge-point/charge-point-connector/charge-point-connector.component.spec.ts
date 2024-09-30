import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargePointConnectorComponent } from './charge-point-connector.component';

describe('ChargePointConnectorComponent', () => {
  let component: ChargePointConnectorComponent;
  let fixture: ComponentFixture<ChargePointConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargePointConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargePointConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
