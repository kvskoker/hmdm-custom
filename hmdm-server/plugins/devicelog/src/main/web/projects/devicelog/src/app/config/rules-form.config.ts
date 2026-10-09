import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TRuleForm } from '../types/rule-form.type';

@Injectable({
  providedIn: 'root',
})
export class RuleFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TRuleForm> {
    return this.fb.group<TRuleForm>({
      name: this.fb.control('', [Validators.required]),
      active: this.fb.control(true),
      severity: this.fb.control('NONE'),
      applicationId: this.fb.control(null, Validators.required),
      filter: this.fb.control(''),
      groupId: this.fb.control(null),
      configurationId: this.fb.control(null),
    });
  }
}
