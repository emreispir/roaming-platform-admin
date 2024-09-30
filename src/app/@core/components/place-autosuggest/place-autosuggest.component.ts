import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BaseComponent } from '../../../shared/base.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-place-autosuggest',
  templateUrl: './place-autosuggest.component.html',
  styleUrls: ['./place-autosuggest.component.scss'],
  imports: [ReactiveFormsModule, TranslateModule, InputTextModule],
  standalone: true,
})
export class PlaceAutosuggestComponent extends BaseComponent
  implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('searchInput', { static: true }) public searchElement: ElementRef;

  @Input() placeholder: string;
  @Input() readOnly: boolean;
  @Input() coordinate: { latitude: any; longitude: any };
  geocoder: google.maps.Geocoder;

  @Output() addressSelectEvent = new EventEmitter<any>();
  private userInteraction = false;

  constructor(
    private ngZone: NgZone,
    protected translateService: TranslateService
  ) {
    super(translateService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.readOnly && changes.readOnly.currentValue === true) {
    }

    if (changes.coordinate && changes.coordinate.currentValue) {
      this.getAddressFromLatLng(
        this.coordinate.latitude,
        this.coordinate.longitude
      ).then((place) => {
        this.searchItem.setValue(place[0].formatted_address);
        this.selectPlace(place[0]);
      });
    }
  }

  ngAfterViewInit() {
    const autocomplete = new google.maps.places.Autocomplete(
      this.searchElement.nativeElement
    );

    this.searchElement.nativeElement.addEventListener(
      this.searchElement,
      () => {
        this.userInteraction = true;
      }
    );

    this.subscription.add(
      this.searchItem.valueChanges
        .pipe(debounceTime(1500), distinctUntilChanged())
        .subscribe((query) => {
          if (this.userInteraction) {
            this.ngZone.run(() => {
              google.maps.event.trigger(autocomplete, 'place_changed');
            });
            this.userInteraction = false;
          }
        })
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place: google.maps.places.PlaceResult = autocomplete.getPlace();
        if (place?.geometry) {
          this.selectPlace(place);
        }
      });
    });
  }

  getAddressFromLatLng(
    latitude: number,
    longitude: number
  ): Promise<google.maps.GeocoderResult[]> {
    const latLng = new google.maps.LatLng(latitude, longitude);
    this.geocoder = new google.maps.Geocoder();
    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      this.geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            resolve([results[0]]);
          } else {
            reject(this.getTranslate('COMMON.NO-RESULT'));
          }
        } else {
          reject(
            this.getTranslate('COMMON.GEOCODER-FAILED', {
              status: status,
            })
          );
        }
      });
    });
  }

  selectPlace(place: any) {
    this.addressSelectEvent.emit(place);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
