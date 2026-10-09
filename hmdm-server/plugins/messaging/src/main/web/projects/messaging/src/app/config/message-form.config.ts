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
      scope: this.fb.control('device'),
      deviceNumber: this.fb.control<string | null>(null, { validators: [Validators.required] }),
      groupId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      configurationId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
      message: this.fb.control('', { validators: [Validators.required] }),
    });
  }
}
