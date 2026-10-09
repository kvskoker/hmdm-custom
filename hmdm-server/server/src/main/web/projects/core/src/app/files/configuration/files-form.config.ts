import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TFilesForm } from '../types/files-form.type';
import { filenameExistsValidator } from '../validators/filename-exists.validator';

@Injectable({ providedIn: 'root' })
export class FilesFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TFilesForm> {
    return this.fb.group<TFilesForm>({
      description: this.fb.control(''),
      external: this.fb.control(false),
      externalUrl: this.fb.control(''),
      file: this.fb.control<File | undefined>(undefined),
      filePath: this.fb.control('', { validators: [filenameExistsValidator()] }),
      devicePath: this.fb.control(''),
      replaceVariables: this.fb.control(false),
    });
  }
}
