import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function patternMessageValidator(
  pattern: string | RegExp,
  errorMessage: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const valid = regex.test(control.value);

    return valid ? null : { [errorMessage]: true };
  };
}
