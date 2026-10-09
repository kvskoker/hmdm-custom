import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TCustomerForm } from '../types/customer-form.type';

@Injectable({
  providedIn: 'root',
})
export class CustomerFormConfig {
  private readonly fb: FormBuilder = inject(FormBuilder);

  getFormGroup(): FormGroup<TCustomerForm> {
    return this.fb.group<TCustomerForm>({
      name: this.fb.nonNullable.control('', Validators.required),
      firstName: this.fb.nonNullable.control(''),
      lastName: this.fb.nonNullable.control(''),
      language: this.fb.nonNullable.control(''),
      email: this.fb.nonNullable.control(''),
      description: this.fb.nonNullable.control(''),
      accountType: this.fb.control(null, Validators.required),
      customerStatus: this.fb.control(null, Validators.required),
      expiryTime: this.fb.control(null, Validators.required),
      deviceLimit: this.fb.control(3, [Validators.required, Validators.min(0)]),
      sizeLimit: this.fb.control(null, [Validators.required, Validators.min(0)]),
      prefix: this.fb.nonNullable.control('', Validators.required),
      deviceConfigurationId: this.fb.control(null, Validators.required),
      configurationIds: this.fb.nonNullable.control([]),
      copyDesign: this.fb.nonNullable.control(false),
    });
  }
}
