import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { patternMessageValidator } from 'hmdm-ui-kit';
import { REGEX } from '../../shared/const/regex.const';
import { TVersionForm } from '../types/version-form.type';

@Injectable({ providedIn: 'root' })
export class VersionFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TVersionForm> {
    return this.fb.group({
      version: this.fb.control(''),
      arch: this.fb.control(''),
      url: this.fb.control('', { validators: [patternMessageValidator(REGEX.apkUrl, 'apkUrl')] }),
      file: this.fb.control<File | null>(null),
      autoUpdate: this.fb.control(false),
    });
  }
}
