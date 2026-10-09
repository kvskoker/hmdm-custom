import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { patternMessageValidator } from 'hmdm-ui-kit';
import { REGEX } from '../../shared/const/regex.const';
import { EditVersionForm } from '../components/edit-version-form/edit-version-form';
import { TEditVersionForm } from '../types/edit-version-form.type';

@Injectable({ providedIn: 'root' })
export class EditVersionFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TEditVersionForm> {
    return this.fb.group<TEditVersionForm>({
      version: this.fb.control(''),
      split: this.fb.control(false),
      url: this.fb.control('', { validators: [patternMessageValidator(REGEX.apkUrl, 'apkUrl')] }),
      urlArm64: this.fb.control(null, {
        validators: [patternMessageValidator(REGEX.apkUrl, 'apkUrl')],
      }),
      urlArmeabi: this.fb.control(null, {
        validators: [patternMessageValidator(REGEX.apkUrl, 'apkUrl')],
      }),
    });
  }
}
