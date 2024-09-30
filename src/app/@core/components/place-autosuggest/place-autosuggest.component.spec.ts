import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceAutosuggestComponent } from './place-autosuggest.component';

describe('PlaceAutosuggestComponent', () => {
  let component: PlaceAutosuggestComponent;
  let fixture: ComponentFixture<PlaceAutosuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceAutosuggestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceAutosuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
