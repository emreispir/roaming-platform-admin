import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargePointListComponent } from './charge-point-list.component';

describe('ChargePointListComponent', () => {
  let component: ChargePointListComponent;
  let fixture: ComponentFixture<ChargePointListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargePointListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargePointListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
