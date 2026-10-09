import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { patternMessageValidator } from 'hmdm-ui-kit';
import { REGEX } from '../../shared/const/regex.const';
import { TApkForm } from '../types/apk-form.type';

@Injectable({ providedIn: 'root' })
export class ApkFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TApkForm> {
    return this.fb.group<TApkForm>({
      arch: this.fb.control(''),
      name: this.fb.control('', { validators: [Validators.required] }),
      pkg: this.fb.control('', { validators: [Validators.required] }),
      runAfterInstall: this.fb.control(false),
      runAtBoot: this.fb.control(false),
      system: this.fb.control(false),
      url: this.fb.control('', { validators: [patternMessageValidator(REGEX.apkUrl, 'apkUrl')] }),
      version: this.fb.control('', { validators: [Validators.required] }),
      file: this.fb.control<File | null>(null),
    });
  }
}
