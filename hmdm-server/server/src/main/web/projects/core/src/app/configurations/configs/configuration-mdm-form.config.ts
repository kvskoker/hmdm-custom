import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TConfigurationMDMForm } from '../types/configuration-mdm-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationMdmFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationMDMForm> {
    return this.fb.group<TConfigurationMDMForm>({
      mainAppId: this.fb.control(null),
      eventReceivingComponent: this.fb.control(''),
      kioskMode: this.fb.control(false),
      contentAppId: this.fb.control(null),
      kioskHome: this.fb.control(false),
      kioskRecents: this.fb.control(false),
      kioskNotifications: this.fb.control(false),
      kioskSystemInfo: this.fb.control(false),
      kioskKeyguard: this.fb.control(false),
      kioskLockButtons: this.fb.control(false),
      kioskExit: this.fb.control(false),
      kioskScreenOn: this.fb.control(false),
      permissive: this.fb.control(false),
      lockSafeSettings: this.fb.control(false),
      allowedClasses: this.fb.control(''),
      wifiSSID: this.fb.control(''),
      wifiPassword: this.fb.control(''),
      wifiSecurityType: this.fb.control(''),
      launcherUrl: this.fb.control(''),
      qrParameters: this.fb.control(''),
      mobileEnrollment: this.fb.control(false),
      encryptDevice: this.fb.control(false),
      restrictions: this.fb.control(''),
      newServerUrl: this.fb.control(''),
    });
  }
}
