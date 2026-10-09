import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TAuditForm } from '../types/audit-form.type';

@Injectable()
export class AuditFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TAuditForm> {
    return this.fb.group<TAuditForm>({
      date: this.fb.control(null),
      messageFilter: this.fb.control(''),
    });
  }
}
