import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TConfigurationBulkForm } from '../types/configuration-bulk-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationBulkFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationBulkForm> {
    return this.fb.group<TConfigurationBulkForm>({
      configurationId: this.fb.control(null, [Validators.required]),
    });
  }
}
