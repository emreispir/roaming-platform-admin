import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appIbanFormat]',
  standalone: true
})
export class IbanFormatDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('ngModelChange', ['$event'])
  onModelChange(event: any) {
    let newValue = event.toUpperCase();
    if (!newValue.startsWith('TR')) {
      newValue = 'TR' + newValue;
    }
    newValue = newValue.replace(/[^0-9TR]/g, '');
    if (newValue.length > 2) {
      newValue =
        newValue.slice(0, 2) + newValue.slice(2).replace(/[^0-9]/g, '');
    }
    if (newValue.length > 34) {
      newValue = newValue.slice(0, 34);
    }
    this.ngControl.valueAccessor.writeValue(newValue);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.ngControl.value.length <= 2 && event.key === 'Backspace') {
      event.preventDefault();
    }
  }
}
