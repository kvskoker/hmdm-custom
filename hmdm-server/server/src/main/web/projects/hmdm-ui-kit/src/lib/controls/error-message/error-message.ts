import { Component, input, InputSignal } from '@angular/core';
import { FormControl, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-error-message',
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, TranslatePipe],
})
export class ErrorMessage {
  control: InputSignal<NgControl | FormControl<unknown>> = input.required();
  optionalValidationKey = input('');

  params: Record<string, unknown> = {};

  getErrorMessage(): string {
    const errors = this.control()?.errors;

    if (!errors) {
      return '';
    }

    if (errors) {
      const firstKey = Object.keys(errors)[0];
      this.params = { ...(errors[firstKey] || {}) };
      const key = this.optionalValidationKey();
      return `${key ? (key + '.') : ''}validation.${firstKey}`;
    }

    return '';
  }
}
