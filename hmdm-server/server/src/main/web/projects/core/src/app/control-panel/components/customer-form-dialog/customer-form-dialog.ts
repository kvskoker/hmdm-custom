import { Component, inject, viewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogBase, DialogCommonButtons, DialogTemplate } from 'hmdm-ui-kit';
import { Subject } from 'rxjs';
import { TCustomerDTO } from '../../../entity/customer/types/customer-dto.type';
import { TCustomerFormValue } from '../../types/customer-form-value.type';
import { CustomerForm } from '../customer-form/customer-form';

@Component({
  selector: 'core-customer-form-dialog',
  templateUrl: './customer-form-dialog.html',
  styleUrl: './customer-form-dialog.scss',
  imports: [DialogTemplate, CustomerForm, DialogCommonButtons],
})
export class CustomerFormDialog extends DialogBase {
  initialData: TCustomerDTO | null = inject(MAT_DIALOG_DATA);

  private readonly customerForm = viewChild.required(CustomerForm);

  get isNew(): boolean {
    return !this.initialData?.id;
  }

  formData: TCustomerFormValue | null = null;
  readonly saveRequest = new Subject<TCustomerFormValue>();

  onSave(): void {
    const form = this.customerForm();
    form.markAllAsTouched();

    if (!form.isValid || !this.formData) {
      return;
    }

    this.saveRequest.next(this.formData);
  }

  onFormChange(value: TCustomerFormValue): void {
    this.formData = value;
  }
}
