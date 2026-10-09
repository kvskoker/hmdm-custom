import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { ConfigurationAppSettingsForm } from '../configuration-app-settings-form/configuration-app-settings-form';
import { ConfigurationAppSettingsFormConfig } from '../../configs/configuration-app-settings-form.config';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';
import { TConfigurationAppSettingsFormValue } from '../../types/configuration-app-settings-form.type';

@Component({
  selector: 'core-configuration-app-settings-dialog',
  templateUrl: './configuration-app-settings-dialog.html',
  styleUrl: './configuration-app-settings-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, ConfigurationAppSettingsForm],
})
export class ConfigurationAppSettingsDialog extends DialogBase implements OnInit {
  private readonly configurationAppSettingsForm = inject(ConfigurationAppSettingsFormConfig);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.configurationAppSettingsForm.getFormGroup();

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue(this.data);
    }
  }

  override onSave(): void {
    const value = this.formGroup.getRawValue();

    if (this.isDuplicateAttribute(value)) {
      this.snackBarService.error('error.duplicate.application.setting');
      return;
    }

    this.dialogRef.close(value);
  }

  private isDuplicateAttribute(value: TConfigurationAppSettingsFormValue): boolean {
    const name = value.name.trim();

    return this.configurationDetailsFacadeService
      .appSettings()
      .some(
        (setting) =>
          setting !== this.data &&
          setting.applicationId === value.applicationId &&
          setting.name.trim() === name,
      );
  }
}
