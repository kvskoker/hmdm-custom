import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogBase, DialogCommonButtons, DialogTemplate } from 'hmdm-ui-kit';
import { TDeviceFormValue } from '../../types/device-form-value.type';
import { DeviceForm } from '../device-form/device-form';

@Component({
  selector: 'core-devices-form-dialog',
  templateUrl: './devices-form-dialog.html',
  styleUrl: './devices-form-dialog.scss',
  imports: [DialogTemplate, DeviceForm, MatButtonModule, DialogCommonButtons],
})
export class DevicesFormDialog extends DialogBase {
  initialData = inject(MAT_DIALOG_DATA);
  formData: TDeviceFormValue | null = null;

  onSave(): void {
    this.dialogRef.close(this.formData);
  }

  onFormChange($event: TDeviceFormValue) {
    this.formData = $event;
  }
}
