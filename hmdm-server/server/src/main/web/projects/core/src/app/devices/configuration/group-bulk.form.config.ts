import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TGroupBulkForm } from '../types/group-bulk-form.type';

@Injectable({
  providedIn: 'root',
})
export class GroupBulkFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TGroupBulkForm> {
    return this.fb.group<TGroupBulkForm>({
      groups: this.fb.control([]),
      action: this.fb.control('set', [Validators.required]),
    });
  }
}
