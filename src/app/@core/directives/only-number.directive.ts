import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumber]',
  standalone: true
})
export class OnlyNumberDirective {
  @HostListener('input', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const initalValue = (event.target as HTMLInputElement).value;
    (event.target as HTMLInputElement).value = initalValue.replace(
      /[^0-9]*/g,
      ''
    );
    if (initalValue !== (event.target as HTMLInputElement).value) {
      event.stopPropagation();
    }
  }
}
