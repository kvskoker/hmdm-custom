import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TSearchForm } from '../types/search-form.type';

@Injectable({
  providedIn: 'root',
})
export class SearchFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSearchForm> {
    return this.fb.group<TSearchForm>({
      interval: this.fb.control(86400),
      dateRange: this.fb.control(null),
      timeFrom: this.fb.control(null),
      timeTo: this.fb.control(null),
    });
  }
}
