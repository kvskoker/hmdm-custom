import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { TaskFormConfig } from '../../config/task-form.config';
import { toFormMessageType, toRequestMessageType } from '../../utils/message-type.util';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'push-task-dialog',
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, TaskForm],
})
export class TaskDialog extends DialogBase implements OnInit {
  private readonly taskFormConfig = inject(TaskFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.taskFormConfig.getFormGroup();

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue(
        { ...this.data, ...toFormMessageType(this.data.messageType) },
        { emitEvent: false },
      );
    }
  }

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
