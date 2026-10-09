import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { matchValueValidator, patternMessageValidator } from 'hmdm-ui-kit';
import { TSignUpCompleteForm } from '../types/sign-up-complete-form.type';

const CUSTOMER_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9.\-_]{4,48}[a-zA-Z0-9]$/;

@Injectable({
  providedIn: 'root',
})
export class SignUpCompleteFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TSignUpCompleteForm> {
    return this.fb.group<TSignUpCompleteForm>({
      customerId: this.fb.control('', [
        Validators.required,
        patternMessageValidator(CUSTOMER_ID_PATTERN, 'customerIdPattern'),
      ]),
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      company: this.fb.control(''),
      description: this.fb.control(''),
      newPassword: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      confirm: this.fb.control('', [
        Validators.required,
        matchValueValidator('newPassword', 'passwordMatch'),
      ]),
    });
  }
}
