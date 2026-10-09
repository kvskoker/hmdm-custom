import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TApplicationsSearchForm } from '../types/applications-search-form.type';

@Injectable()
export class ApplicationsSearchFormConfig {
  private fb: FormBuilder = inject(FormBuilder);

  getFormGroup(): FormGroup<TApplicationsSearchForm> {
    return this.fb.group({
      showSystem: this.fb.control(false),
      showMy: this.fb.control(false),
    });
  }
}
