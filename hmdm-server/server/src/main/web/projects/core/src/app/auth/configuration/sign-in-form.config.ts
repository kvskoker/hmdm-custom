import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TSignInForm } from '../types/sign-in-form.type';

@Injectable({
  providedIn: 'root',
})
export class SignInFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSignInForm> {
    return this.fb.group<TSignInForm>({
      login: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    });
  }
}
