/* eslint-disable @angular-eslint/directive-selector */
import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector:
    'li:not([routerLink]):not([href]):not([click]), a:not([routerLink]):not([href])',
  standalone: true
})
export class DisableIfNoActionDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const isNavItem = this.el.nativeElement.classList.contains('nav-item');
    const isDrop = this.el.nativeElement.classList.contains('dropdown-item');
    const hasLink = this.checkForLink();

    if (!isNavItem && !isDrop && !hasLink) {
      this.renderer.addClass(this.el.nativeElement, 'disabled-element');
    }
  }

  private checkForLink(): boolean {
    // Get the element
    const element = this.el.nativeElement;

    // If the element is an 'a' with an 'href' or 'routerLink' attribute, return true
    if (
      element.tagName.toLowerCase() === 'a' &&
      (element.hasAttribute('href') || element.hasAttribute('routerLink'))
    ) {
      return true;
    }

    // If the element is an 'li', check if it contains an 'a' element with an 'href' or 'routerLink' attribute
    if (element.tagName.toLowerCase() === 'li') {
      const aElement = element.querySelector('a[href], a[routerLink]');

      // If an 'a' element with an 'href' or 'routerLink' attribute is found, return true, otherwise, return false
      return !!aElement;
    }

    // Return false for other cases
    return false;
  }
}
