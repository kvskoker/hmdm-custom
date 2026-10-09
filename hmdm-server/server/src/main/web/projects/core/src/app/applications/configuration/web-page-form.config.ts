import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { patternMessageValidator } from 'hmdm-ui-kit';
import { REGEX } from '../../shared/const/regex.const';
import { TWebPageForm } from '../types/web-page-form.type';

@Injectable({ providedIn: 'root' })
export class WebPageFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TWebPageForm> {
    return this.fb.group<TWebPageForm>({
      name: this.fb.control('', { validators: [Validators.required] }),
      url: this.fb.control('', {
        validators: [Validators.required, patternMessageValidator(REGEX.filePath, 'filePath')],
      }),
      useKiosk: this.fb.control(false),
    });
  }
}
