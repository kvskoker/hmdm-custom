import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DialogBase,
  DialogTemplate,
  TextAreaInputComponent,
  TextInputComponent,
  TranslatePipe,
  DialogCommonButtons,
  MAT_DIALOG_DATA,
} from 'hmdm-ui-kit';
import { ConfigurationCopyFormConfig } from '../../configs/configuration-copy-form.config';
import { TConfigurationCopyForm } from '../../types/configuration-copy-form.type';

@Component({
  selector: 'core-configuration-copy-dialog',
  templateUrl: './configuration-copy-dialog.html',
  styleUrl: './configuration-copy-dialog.scss',
  imports: [
    TextInputComponent,
    TextAreaInputComponent,
    TranslatePipe,
    ReactiveFormsModule,
    DialogTemplate,
    DialogCommonButtons,
  ],
})
export class ConfigurationCopyDialog extends DialogBase implements OnInit {
  private readonly configurationCopyFormConfig = inject(ConfigurationCopyFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup: FormGroup<TConfigurationCopyForm> = this.configurationCopyFormConfig.getFormGroup();

  ngOnInit(): void {
    this.formGroup.patchValue({
      name: `${this.data.name} - Copy`,
      description: this.data.description,
    });
  }

  override onSave(): void {
    this.dialogRef.close(this.formGroup.getRawValue());
  }
}
