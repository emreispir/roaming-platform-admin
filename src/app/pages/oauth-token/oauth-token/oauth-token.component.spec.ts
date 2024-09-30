import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OauthTokenComponent } from './oauth-token.component';

describe('OauthTokenComponent', () => {
  let component: OauthTokenComponent;
  let fixture: ComponentFixture<OauthTokenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OauthTokenComponent]
    });
    fixture = TestBed.createComponent(OauthTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
