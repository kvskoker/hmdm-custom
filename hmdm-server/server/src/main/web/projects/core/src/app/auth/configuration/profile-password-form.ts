import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { matchValueValidator } from 'hmdm-ui-kit';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { TProfilePasswordForm } from '../types/profile-password-form.type';

@Injectable({
  providedIn: 'root',
})
export class ProfilePasswordFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  getFormGroup(): FormGroup<TProfilePasswordForm> {
    return this.fb.group<TProfilePasswordForm>({
      oldPassword: this.fb.control('', [Validators.required]),
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
