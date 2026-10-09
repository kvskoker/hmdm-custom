import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TSearchDevicesForm } from '../types/devices-form.type';

@Injectable({
  providedIn: 'root',
})
export class SearchDevicesFormConfig {
  private fb: FormBuilder = inject(FormBuilder);

  getFormGroup(): FormGroup<TSearchDevicesForm> {
    return this.fb.group<TSearchDevicesForm>({
      androidVersion: this.fb.control(null),
      configurationId: this.fb.control(null),
      enrollmentDate: this.fb.control(null),
      fastSearch: this.fb.control(null),
      groupId: this.fb.control(null),
      imeiChanged: this.fb.control(null),
      kioskMode: this.fb.control(null),
      launcherVersion: this.fb.control(null),
      installationStatus: this.fb.control(null),
      mdmMode: this.fb.control(null),
      status: this.fb.control(null),
      time: this.fb.control(null),
      customTime: this.fb.control(null),
    });
  }
}
