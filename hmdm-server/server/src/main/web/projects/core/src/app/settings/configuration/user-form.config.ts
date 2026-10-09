import { Injectable, inject } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { matchValueValidator } from 'hmdm-ui-kit';
import { DEFAULT_ALERT_LEVEL } from '../../entity/user/constants/alert-level.constant';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { TUserForm } from '../types/user-form.type';

function editModePasswordValidator(strengthValidators: ValidatorFn[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const composite = Validators.compose(strengthValidators);
    return composite ? composite(control) : null;
  };
}

function editModeConfirmValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null;
    const passwordControl = control.parent.get(passwordControlName);
    const passwordValue = passwordControl?.value ?? '';
    const confirmValue = control.value ?? '';
    if (!passwordValue && !confirmValue) return null;
    if (confirmValue !== passwordValue) {
      return {
        passwordMatch: {
          expected: passwordValue,
          actual: confirmValue,
          matchField: passwordControlName,
        },
      };
    }
    return null;
  };
}

@Injectable({ providedIn: 'root' })
export class UserFormConfig {
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(isEditMode = false): FormGroup<TUserForm> {
    const passwordValidators = isEditMode
      ? [editModePasswordValidator(this.settingsFacadeService.getPasswordStrengthValidators())]
      : this.settingsFacadeService.getPasswordValidators();

    const confirmValidators = isEditMode
      ? [editModeConfirmValidator('newPassword')]
      : [Validators.required, matchValueValidator('newPassword', 'passwordMatch')];

    const userRoleValidators = isEditMode ? [] : [Validators.required];

    const form = this.fb.group<TUserForm>({
      login: this.fb.control('', { validators: [Validators.required] }),
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
      }),
      name: this.fb.control('', { validators: [Validators.required] }),
      allConfigAvailable: this.fb.control(false),
      allDevicesAvailable: this.fb.control(false),
      newPassword: this.fb.control('', { validators: passwordValidators }),
      confirm: this.fb.control('', { validators: confirmValidators }),
      configurations: this.fb.control([]),
      groups: this.fb.control([]),
      userRole: this.fb.control(null, { validators: userRoleValidators }),
      alertLevel: this.fb.control(DEFAULT_ALERT_LEVEL),
    });

    if (isEditMode) {
      const { newPassword, confirm } = form.controls;
      newPassword.valueChanges.subscribe(() =>
        confirm.updateValueAndValidity({ emitEvent: false }),
      );
    }

    return form;
  }
}
