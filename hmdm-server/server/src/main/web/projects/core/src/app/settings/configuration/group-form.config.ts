import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TGroupForm } from '../types/group-form.type';

@Injectable({ providedIn: 'root' })
export class GroupFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TGroupForm> {
    return this.fb.group<TGroupForm>({
      name: this.fb.control('', [Validators.required]),
    });
  }
}
