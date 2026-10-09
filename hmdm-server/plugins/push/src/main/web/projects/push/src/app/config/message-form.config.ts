import { Injectable, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { TMessageForm } from '../types/message-form.type';

@Injectable({
  providedIn: 'root',
})
export class MessageFormConfig {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TMessageForm> {
    return this.fb.group<TMessageForm>({
      configurationId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      customMessageType: this.fb.control('', { validators: [Validators.required] }),
      messageType: this.fb.control('configUpdated', { validators: [Validators.required] }),
      scope: this.fb.control('device'),
      deviceNumber: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      groupId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      payload: this.fb.control(''),
    });
  }
}
