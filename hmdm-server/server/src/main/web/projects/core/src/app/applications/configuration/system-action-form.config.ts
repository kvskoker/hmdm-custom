import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TSystemActionForm } from '../types/system-action-form.type';

@Injectable({ providedIn: 'root' })
export class SystemActionFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSystemActionForm> {
    return this.fb.group<TSystemActionForm>({
      name: this.fb.control('', { validators: [Validators.required] }),
      intent: this.fb.control('', { validators: [Validators.required] }),
    });
  }
}
