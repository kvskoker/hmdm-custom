import { Component, inject, OnInit } from '@angular/core';
import {
  DialogBase,
  DialogTemplate,
  MatButtonModule,
  MatCardModule,
  TranslatePipe,
  DialogCommonButtons,
  MAT_DIALOG_DATA,
} from 'hmdm-ui-kit';
import { IconFormConfig } from '../../configuration/icon-form.config';
import { IconForm } from '../icon-form/icon-form';

@Component({
  selector: 'core-icon-dialog',
  templateUrl: './icon-dialog.html',
  styleUrl: './icon-dialog.scss',
  imports: [
    DialogTemplate,
    TranslatePipe,
    MatCardModule,
    IconForm,
    MatButtonModule,
    DialogCommonButtons,
  ],
})
export class IconDialog extends DialogBase implements OnInit {
  private readonly iconFormConfig = inject(IconFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.iconFormConfig.getFormGroup();

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue(this.data);
    }
  }

  override onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.formGroup.getRawValue());
  }
}
