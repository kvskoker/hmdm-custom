import { Directive, input, InputSignal, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[hmdmPersistControl]',
  standalone: true,
})
export class PersistControlDirective implements OnInit, OnDestroy {
  hmdmPersistControl: InputSignal<string> = input.required();

  private destroy$ = new Subject<void>();
  private storageKey = '';

  constructor(private ngControl: NgControl) {}

  ngOnInit(): void {
    if (!this.hmdmPersistControl()) {
      console.warn('hmdmPersistControl directive requires a storage key');
      return;
    }

    this.storageKey = `form_control_${this.hmdmPersistControl()}`;

    const savedValue = localStorage.getItem(this.storageKey);
    if (savedValue !== null) {
      try {
        const parsedValue = JSON.parse(savedValue);
        this.ngControl.control?.setValue(parsedValue);
      } catch (e) {
        this.ngControl.control?.setValue(savedValue);
      }
    }

    this.ngControl.control?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save control value to localStorage', e);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
