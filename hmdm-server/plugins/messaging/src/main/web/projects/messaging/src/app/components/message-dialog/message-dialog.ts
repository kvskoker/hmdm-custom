import { Component, inject } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate } from 'hmdm-ui-kit';
import { MessageForm } from '../message-form/message-form';
import { MessageFormConfig } from '../../config/message-form.config';

@Component({
  selector: 'messaging-message-dialog',
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

    this.dialogRef.close(this.formGroup.value);
  }
}
