import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestSessionListComponent } from './latest-session-list.component';

describe('LatestSessionListComponent', () => {
  let component: LatestSessionListComponent;
  let fixture: ComponentFixture<LatestSessionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LatestSessionListComponent]
    });
    fixture = TestBed.createComponent(LatestSessionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
