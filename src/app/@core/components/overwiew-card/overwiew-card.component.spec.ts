import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverwiewCardComponent } from './overwiew-card.component';

describe('OverwiewCardComponent', () => {
  let component: OverwiewCardComponent;
  let fixture: ComponentFixture<OverwiewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverwiewCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverwiewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
