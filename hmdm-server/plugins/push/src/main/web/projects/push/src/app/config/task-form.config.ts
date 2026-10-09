import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TMessageForm } from '../types/message-form.type';
import { TTaskForm } from '../types/task-form.type';

@Injectable({
  providedIn: 'root',
})
export class TaskFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TTaskForm> {
    return this.fb.group<TTaskForm>({
      comment: this.fb.control(''),
      configurationId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      customMessageType: this.fb.control('', { validators: [Validators.required] }),
      deviceNumber: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      groupId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      messageType: this.fb.control('configUpdated', { validators: [Validators.required] }),
      payload: this.fb.control(''),
      scope: this.fb.control('device'),
      min: this.fb.control('30', { validators: [Validators.required] }),
      hour: this.fb.control('*/12', { validators: [Validators.required] }),
      day: this.fb.control('*', { validators: [Validators.required] }),
      weekday: this.fb.control('*', { validators: [Validators.required] }),
      month: this.fb.control('*', { validators: [Validators.required] }),
    });
  }
}
