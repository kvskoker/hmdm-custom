import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TDevicesSettingsForm } from '../types/devices-settings-form.type';

@Injectable({ providedIn: 'root' })
export class DevicesSettingsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TDevicesSettingsForm> {
    return this.fb.group<TDevicesSettingsForm>({
      roleId: this.fb.control<number>(0, [Validators.required]),
      columnDisplayedAndroidVersion: this.fb.control(false),
      columnDisplayedBatteryLevel: this.fb.control(false),
      columnDisplayedCustom1: this.fb.control(false),
      columnDisplayedCustom2: this.fb.control(false),
      columnDisplayedCustom3: this.fb.control(false),
      columnDisplayedDefaultLauncher: this.fb.control(false),
      columnDisplayedDeviceAppInstallStatus: this.fb.control(false),
      columnDisplayedDeviceConfiguration: this.fb.control(false),
      columnDisplayedDeviceDate: this.fb.control(false),
      columnDisplayedDeviceDesc: this.fb.control(false),
      columnDisplayedDeviceFilesStatus: this.fb.control(false),
      columnDisplayedDeviceGroup: this.fb.control(false),
      columnDisplayedDeviceImei: this.fb.control(false),
      columnDisplayedDeviceModel: this.fb.control(false),
      columnDisplayedDeviceNumber: this.fb.control(false),
      columnDisplayedDevicePermissionsStatus: this.fb.control(false),
      columnDisplayedDevicePhone: this.fb.control(false),
      columnDisplayedDeviceStatus: this.fb.control(false),
      columnDisplayedEnrollmentDate: this.fb.control(false),
      columnDisplayedKioskMode: this.fb.control(false),
      columnDisplayedLauncherVersion: this.fb.control(false),
      columnDisplayedMdmMode: this.fb.control(false),
      columnDisplayedPublicIp: this.fb.control(false),
      columnDisplayedSerial: this.fb.control(false),
    });
  }
}
