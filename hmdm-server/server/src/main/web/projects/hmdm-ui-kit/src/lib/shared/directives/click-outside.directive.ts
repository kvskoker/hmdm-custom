import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target || !(target instanceof HTMLElement)) {
      return;
    }

    // Ignore clicks within any CDK overlay container
    if (this.isWithinCdkOverlay(target)) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }

  private isWithinCdkOverlay(element: HTMLElement): boolean {
    // Check if the clicked element or any of its ancestors is within a CDK overlay container
    return (
      element.closest('.cdk-overlay-container') !== null ||
      element.classList.contains('cdk-overlay-container') ||
      element.closest('.cdk-overlay-backdrop') !== null ||
      element.classList.contains('cdk-overlay-backdrop') ||
      // Also check for specific Material components as fallback
      element.closest('.mat-mdc-option') !== null ||
      this.isCalendar(element)
    );
  }

  private isCalendar(element: HTMLElement): boolean {
    return Array.from(element.classList).some((className) => className.startsWith('mat-calendar'));
  }
}
