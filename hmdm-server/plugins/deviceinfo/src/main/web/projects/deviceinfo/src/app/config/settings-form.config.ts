import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TSettingsForm } from '../types/settings-form.type';

@Injectable({
  providedIn: 'root',
})
export class SettingsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSettingsForm> {
    return this.fb.group<TSettingsForm>({
      intervalMins: this.fb.control(120),
      dataPreservePeriod: this.fb.control(30, [Validators.required, Validators.min(1)]),
      sendData: this.fb.control(true),
    });
  }
}
