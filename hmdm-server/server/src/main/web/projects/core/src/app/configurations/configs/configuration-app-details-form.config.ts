import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TConfigurationAppDetailsForm } from '../types/configuration-app-details-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationAppDetailsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationAppDetailsForm> {
    return this.fb.group<TConfigurationAppDetailsForm>({
      keyCode: this.fb.control(''),
      bottom: this.fb.control(false),
      longTap: this.fb.control(false),
    });
  }
}
