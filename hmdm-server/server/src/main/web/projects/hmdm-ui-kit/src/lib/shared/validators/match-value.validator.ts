import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchValueValidator(
  controlName: string,
  errorMessage: string = 'matchValue',
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const controlToMatch = control.parent.get(controlName);

    if (!controlToMatch) {
      return null;
    }

    if (control.value !== controlToMatch.value) {
      return {
        [errorMessage]: {
          expected: controlToMatch.value,
          actual: control.value,
          matchField: controlName,
        },
      };
    }

    return null;
  };
}
