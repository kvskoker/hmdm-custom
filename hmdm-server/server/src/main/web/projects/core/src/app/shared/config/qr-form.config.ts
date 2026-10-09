import { inject, Injectable } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { TQrForm } from '../types/qr-form.type';

@Injectable({
  providedIn: 'root',
})
export class QrFormConfig {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  getFormGroup(): FormGroup<TQrForm> {
    return this.fb.group({
      deviceId: this.fb.control<string | null>(null),
      useId: this.fb.control<string | null>(null),
      create: this.fb.control<boolean>(false),
      groups: this.fb.control<number[] | null>(null),
    });
  }
}
