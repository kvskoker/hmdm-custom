import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TSearchMessagesForm } from '../types/search-messages-form.type';
import { inject } from '@angular/core/primitives/di';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchMessagesFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSearchMessagesForm> {
    return this.fb.group<TSearchMessagesForm>({
      dateRange: this.fb.control(null),
      deviceFilter: this.fb.control(''),
    });
  }
}
