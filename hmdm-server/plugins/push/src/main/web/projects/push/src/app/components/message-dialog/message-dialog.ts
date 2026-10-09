import { Component, inject } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate } from 'hmdm-ui-kit';
import { MessageFormConfig } from '../../config/message-form.config';
import { toRequestMessageType } from '../../utils/message-type.util';
import { MessageForm } from '../message-form/message-form';

@Component({
  selector: 'push-message-dialog',
  templateUrl: './message-dialog.html',
  styleUrl: './message-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, MessageForm],
})
export class MessageDialog extends DialogBase {
  private readonly messageFormConfig = inject(MessageFormConfig);

  formGroup = this.messageFormConfig.getFormGroup();

  override onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { customMessageType, ...value } = this.formGroup.getRawValue();

    this.dialogRef.close({
      ...value,
      messageType: toRequestMessageType({ ...value, customMessageType }),
    });
  }
}
