import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import {
  BaseComponent,
  Checkbox,
  MatAnchor,
  MatCardModule,
  MatIconModule,
  Selector,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { GeneralSettingsFormConfig } from '../../configuration/general-settings-form.config';
import { LANGUAGE_OPTIONS } from '../../const/language-options.const';
import { LOGOUT_OPTIONS } from '../../const/logout-options.const';
import { PASSWORD_STRENGTH_OPTIONS } from '../../const/password-strength-options.const';
import { TGeneralSettingsFormValue } from '../../types/general-settings-form.type';
import { GeneralSettingsFacadeService } from '../../services/general-settings-facade.service';

@Component({
  selector: 'core-general-settings',
  templateUrl: './general-settings.html',
  styleUrl: './general-settings.scss',
  imports: [
    MatCardModule,
    TranslatePipe,
    Checkbox,
    Selector,
    TextInputComponent,
    MatDivider,
    ReactiveFormsModule,
    MatAnchor,
    MatIconModule,
  ],
})
export class GeneralSettings extends BaseComponent {
  private readonly generalSettingsFormConfig = inject(GeneralSettingsFormConfig);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly generalSettingsFacadeService = inject(GeneralSettingsFacadeService);

  formGroup = this.generalSettingsFormConfig.getFormGroup();

  languageOptions = LANGUAGE_OPTIONS;
  passwordStrengthOptions = PASSWORD_STRENGTH_OPTIONS;
  logoutOptions = LOGOUT_OPTIONS;

  get formGroupValue(): TGeneralSettingsFormValue {
    return this.formGroup.getRawValue();
  }

  constructor() {
    super();

    effect(() => {
      const settings = this.settingsFacadeService.settings();
      if (settings) {
        this.formGroup.patchValue({
          ...settings,
          newDeviceConfigurationId: 0,
          newDeviceGroupId: 0,
        });
      }
    });
  }

  onSave(): void {
    if (this.formGroup.invalid) {
      return;
    }

    this.generalSettingsFacadeService.updateSettings(this.formGroupValue);
  }
}
