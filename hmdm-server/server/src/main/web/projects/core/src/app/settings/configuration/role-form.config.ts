import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TRoleForm } from '../types/role-form.type';

@Injectable({ providedIn: 'root' })
export class RoleFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TRoleForm> {
    return this.fb.group<TRoleForm>({
      name: this.fb.control('', [Validators.required]),
      permissions: this.fb.control([]),
    });
  }
}
