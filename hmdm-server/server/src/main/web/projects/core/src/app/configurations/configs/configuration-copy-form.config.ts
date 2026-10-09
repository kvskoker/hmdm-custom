import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TConfigurationCopyForm } from '../types/configuration-copy-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationCopyFormConfig {
  private readonly fb = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationCopyForm> {
    return this.fb.group<TConfigurationCopyForm>({
      name: this.fb.control('', { validators: [Validators.required] }),
      description: this.fb.control(''),
    });
  }
}
