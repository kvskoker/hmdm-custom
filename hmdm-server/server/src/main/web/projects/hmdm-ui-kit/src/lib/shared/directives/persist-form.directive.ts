import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Directive({
  selector: '[hmdmPersistForm]',
  standalone: true,
})
export class PersistFormDirective implements OnInit, OnDestroy {
  @Input() hmdmPersistForm!: FormGroup;
  @Input() persistFormKey!: string;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (!this.hmdmPersistForm || !this.persistFormKey) {
      console.warn('PersistFormDirective: FormGroup and key are required');
      return;
    }

    this.loadFormData();

    this.hmdmPersistForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((values) => {
        this.saveFormData(values);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFormData(): void {
    try {
      const savedData = localStorage.getItem(this.persistFormKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.hmdmPersistForm.patchValue(parsedData);
      }
    } catch (error) {
      console.error('PersistFormDirective: Error loading form data', error);
    }
  }

  private saveFormData(values: any): void {
    try {
      localStorage.setItem(this.persistFormKey, JSON.stringify(values));
    } catch (error) {
      console.error('PersistFormDirective: Error saving form data', error);
    }
  }
}
