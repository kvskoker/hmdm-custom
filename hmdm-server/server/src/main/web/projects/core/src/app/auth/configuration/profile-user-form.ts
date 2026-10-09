import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { DEFAULT_ALERT_LEVEL } from '../../entity/user/constants/alert-level.constant';
import { TProfileUserForm } from '../types/profile-user-form.type';

@Injectable({
  providedIn: 'root',
})
export class ProfileUserFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TProfileUserForm> {
    return this.fb.group<TProfileUserForm>({
      login: this.fb.control('', [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      alertLevel: this.fb.control({ value: DEFAULT_ALERT_LEVEL, disabled: true }),
    });
  }
}
