import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TForgotPasswordForm } from '../types/forgot-password-form.type';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TForgotPasswordForm> {
    return this.fb.group<TForgotPasswordForm>({
      login: this.fb.control('', [Validators.required]),
    });
  }
}
