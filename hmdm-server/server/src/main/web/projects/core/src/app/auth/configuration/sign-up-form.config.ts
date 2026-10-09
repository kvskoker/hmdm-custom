import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TSignUpForm } from '../types/sign-up-form.type';

@Injectable({
  providedIn: 'root',
})
export class SignUpFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSignUpForm> {
    return this.fb.group<TSignUpForm>({
      email: this.fb.control('', [Validators.required, Validators.email]),
    });
  }
}
