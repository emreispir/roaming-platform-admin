import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportWidgetCardComponent } from './report-widget-card.component';

describe('ReportWidgetCardComponent', () => {
  let component: ReportWidgetCardComponent;
  let fixture: ComponentFixture<ReportWidgetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportWidgetCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportWidgetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
