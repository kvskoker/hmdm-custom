import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Checkbox,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatIcon,
  Selector,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { SettingsFormConfig } from '../../config/settings-form.config';
import { SettingsFacadeService } from '../../services/settings-facade.service';
import { SETTINGS_INTERVAL_OPTIONS } from '../../const/settings-interval-options.const';

@Component({
  selector: 'di-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  imports: [
    MatCardModule,
    MatIcon,
    MatButtonModule,
    TranslatePipe,
    TextInputComponent,
    Checkbox,
    Selector,
    ReactiveFormsModule,
    LoaderDirective,
  ],
})
export class Settings {
  private readonly settingsFormConfig = inject(SettingsFormConfig);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  formGroup = this.settingsFormConfig.getFormGroup();
  intervalOptions = SETTINGS_INTERVAL_OPTIONS;
  isLoadingSettings = this.settingsFacadeService.isLoadingSettings;

  constructor() {
    effect(() => {
      const settings = this.settingsFacadeService.settings();
      if (settings) {
        this.formGroup.patchValue({
          intervalMins: settings.intervalMins,
          dataPreservePeriod: settings.dataPreservePeriod,
          sendData: settings.sendData,
        });
      }
    });
  }

  onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.settingsFacadeService.saveSettings(this.formGroup.getRawValue());
  }
}
