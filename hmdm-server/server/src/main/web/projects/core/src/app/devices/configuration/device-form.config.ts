import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TSearchDevicesForm } from '../types/devices-form.type';
import { TDeviceForm } from '../types/device-form.type';

@Injectable({
  providedIn: 'root',
})
export class DeviceFormConfig {
  private fb: FormBuilder = inject(FormBuilder);

  getFormGroup(): FormGroup<TDeviceForm> {
    return this.fb.group<TDeviceForm>({
      configurationId: this.fb.control(null),
      groups: this.fb.nonNullable.control([]),
      imei: this.fb.nonNullable.control(''),
      phone: this.fb.nonNullable.control(''),
      number: this.fb.nonNullable.control(''),
      description: this.fb.control(''),
      custom1: this.fb.control(''),
      custom2: this.fb.control(''),
      custom3: this.fb.control(''),
    });
  }
}
