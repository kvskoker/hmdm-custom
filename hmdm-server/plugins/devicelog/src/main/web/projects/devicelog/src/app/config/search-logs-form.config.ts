import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { inject } from '@angular/core/primitives/di';
import { Injectable } from '@angular/core';
import { TSearchLogsForm } from '../types/search-logs-form.type';

@Injectable({
  providedIn: 'root',
})
export class SearchMessagesFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSearchLogsForm> {
    return this.fb.group<TSearchLogsForm>({
      dateRange: this.fb.control(null),
      deviceFilter: this.fb.control(''),
      applicationFilter: this.fb.control(''),
      severity: this.fb.control(-1),
    });
  }
}
