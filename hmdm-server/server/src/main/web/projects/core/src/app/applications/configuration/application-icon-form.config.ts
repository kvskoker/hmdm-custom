import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TApplicationIconForm } from '../types/application-icon-form.type';

@Injectable({ providedIn: 'root' })
export class ApplicationIconFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TApplicationIconForm> {
    return this.fb.group<TApplicationIconForm>({
      showIcon: this.fb.control(false),
      iconId: this.fb.control(null),
      iconText: this.fb.control(null),
    });
  }
}
