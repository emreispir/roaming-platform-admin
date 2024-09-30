import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorListComponent } from './connector-list.component';

describe('ConnectorListComponent', () => {
  let component: ConnectorListComponent;
  let fixture: ComponentFixture<ConnectorListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConnectorListComponent]
    });
    fixture = TestBed.createComponent(ConnectorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
