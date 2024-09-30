import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargePointDetailComponent } from './charge-point-detail.component';

describe('ChargePointDetailComponent', () => {
  let component: ChargePointDetailComponent;
  let fixture: ComponentFixture<ChargePointDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargePointDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargePointDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
