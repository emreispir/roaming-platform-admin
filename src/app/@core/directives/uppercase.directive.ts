import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  constructor(public ngControl: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initialValue = this.ngControl.value;

    const uppercasedValue = initialValue.toUpperCase();

    this.ngControl?.control?.setValue(uppercasedValue);
  }
}
