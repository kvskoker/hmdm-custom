import { inject } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FilesFacadeService } from '../services/files-facade.service';

export function filenameExistsValidator(): ValidatorFn {
  const fileFacadeService = inject(FilesFacadeService);

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    return fileFacadeService.files().find((file) => file.filePath === control.value)
      ? { filenameExists: true }
      : null;
  };
}
