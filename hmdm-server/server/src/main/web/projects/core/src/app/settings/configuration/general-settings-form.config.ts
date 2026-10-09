import { inject, Injectable } from '@angular/core';
import { TGeneralSettingsForm } from '../types/general-settings-form.type';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TGeneralSettingsForm> {
    return this.fb.group<TGeneralSettingsForm>({
      useDefaultLanguage: this.fb.control(false),
      language: this.fb.control(''),
      phoneNumberFormat: this.fb.control(''),
      customPropertyName1: this.fb.control(''),
      customMultiline1: this.fb.control(false),
      customSend1: this.fb.control(false),
      customPropertyName2: this.fb.control(''),
      customMultiline2: this.fb.control(false),
      customSend2: this.fb.control(false),
      customPropertyName3: this.fb.control(''),
      customMultiline3: this.fb.control(false),
      customSend3: this.fb.control(false),
      sendDescription: this.fb.control(false),
      passwordLength: this.fb.control(0),
      passwordStrength: this.fb.control(0),
      passwordReset: this.fb.control(false),
      idleLogout: this.fb.control(0),
      createNewDevices: this.fb.control(false),
      newDeviceConfigurationId: this.fb.control(0),
      newDeviceGroupId: this.fb.control(0),
    });
  }
}
