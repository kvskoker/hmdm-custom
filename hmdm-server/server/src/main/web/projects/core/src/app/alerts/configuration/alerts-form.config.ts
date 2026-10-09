import {inject, Injectable} from '@angular/core';
import {FormGroup, NonNullableFormBuilder} from '@angular/forms';
import {TAlertsForm} from '../types/alerts-form.type';

@Injectable({ providedIn: 'root' })
export class AlertsFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TAlertsForm> {
    return this.fb.group<TAlertsForm>({
      deviceFilter: this.fb.control(null),
      date: this.fb.control(null),
      severity: this.fb.control(10)
    });
  }
}
