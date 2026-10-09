import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TConfigurationCommonForm } from '../types/configuration-common-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationCommonFormConfig {
  private readonly fb = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TConfigurationCommonForm> {
    return this.fb.group<TConfigurationCommonForm>({
      name: this.fb.control(''),
      description: this.fb.control(''),
      password: this.fb.control(''),
      requestUpdates: this.fb.control(''),
      appPermissions: this.fb.control(''),
      pushOptions: this.fb.control(''),
      keepaliveTime: this.fb.control(undefined),
      gps: this.fb.control(null),
      bluetooth: this.fb.control(null),
      wifi: this.fb.control(null),
      mobileData: this.fb.control(null),
      usbStorage: this.fb.control(false),
      autoBrightness: this.fb.control(null),
      brightness: this.fb.control(null),
      manageTimeout: this.fb.control(false),
      timeout: this.fb.control(null),
      lockVolume: this.fb.control(false),
      manageVolume: this.fb.control(false),
      volume: this.fb.control(null),
      timeZoneMode: this.fb.control('default'),
      timeZone: this.fb.control(null),
      systemUpdateType: this.fb.control(0),
      systemUpdateFrom: this.fb.control(null),
      systemUpdateTo: this.fb.control(null),
      scheduleAppUpdate: this.fb.control(false),
      appUpdateFrom: this.fb.control(null),
      appUpdateTo: this.fb.control(null),
      downloadUpdates: this.fb.control(''),
      passwordMode: this.fb.control(''),
      showWifi: this.fb.control(false),
      runDefaultLauncher: this.fb.control(false),
      disableScreenshots: this.fb.control(false),
      autostartForeground: this.fb.control(false),
    });
  }
}
