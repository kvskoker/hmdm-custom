import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TIconForm } from '../types/icon-form.type';

@Injectable({ providedIn: 'root' })
export class IconFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TIconForm> {
    return this.fb.group<TIconForm>({
      name: this.fb.control('', { validators: [Validators.required] }),
      fileId: this.fb.control(null, { validators: [Validators.required] }),
    });
  }
}
