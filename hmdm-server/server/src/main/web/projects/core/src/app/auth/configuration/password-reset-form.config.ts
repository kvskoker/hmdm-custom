import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { matchValueValidator } from 'hmdm-ui-kit';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { TPasswordResetForm } from '../types/password-reset-form.type';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  getFormGroup(): FormGroup<TPasswordResetForm> {
    return this.fb.group<TPasswordResetForm>({
      newPassword: this.fb.control('', {
        validators: this.settingsFacadeService.getPasswordValidators(),
      }),
      confirm: this.fb.control('', [
        Validators.required,
        matchValueValidator('newPassword', 'passwordMatch'),
      ]),
    });
  }
}
