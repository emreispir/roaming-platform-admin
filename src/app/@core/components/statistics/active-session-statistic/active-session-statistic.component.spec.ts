import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionStatisticComponent } from './active-session-statistic.component';

describe('ActiveSessionStatisticComponent', () => {
  let component: ActiveSessionStatisticComponent;
  let fixture: ComponentFixture<ActiveSessionStatisticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActiveSessionStatisticComponent]
    });
    fixture = TestBed.createComponent(ActiveSessionStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
