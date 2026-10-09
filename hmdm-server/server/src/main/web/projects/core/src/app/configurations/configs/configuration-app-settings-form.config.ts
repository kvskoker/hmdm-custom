import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TConfigurationAppSettingsForm } from '../types/configuration-app-settings-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationAppSettingsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationAppSettingsForm> {
    return this.fb.group<TConfigurationAppSettingsForm>({
      applicationId: this.fb.control(null),
      name: this.fb.control(''),
      value: this.fb.control(''),
      variable: this.fb.control(false),
      comment: this.fb.control(''),
    });
  }
}
