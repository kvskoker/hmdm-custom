import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Checkbox,
  SelectSearch,
  TextAreaInputComponent,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';
import { TConfigurationAppSettingsForm } from '../../types/configuration-app-settings-form.type';

@Component({
  selector: 'core-configuration-app-settings-form',
  templateUrl: './configuration-app-settings-form.html',
  styleUrl: './configuration-app-settings-form.scss',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    TextAreaInputComponent,
    TranslatePipe,
    SelectSearch,
    Checkbox,
  ],
})
export class ConfigurationAppSettingsForm {
  formGroup: InputSignal<FormGroup<TConfigurationAppSettingsForm>> = input.required();

  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  applicationOptions = this.configurationAppsFacadeService.applicationsIdOptions;
}
