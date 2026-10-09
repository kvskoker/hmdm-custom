import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DialogBase,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { ConfigurationAppDetailsFormConfig } from '../../configs/configuration-app-details-form.config';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';
import {
  TConfigurationAppDetailsForm,
  TConfigurationAppDetailsFormValue,
} from '../../types/configuration-app-details-form.type';
import { ConfigurationAppDetailsForm } from '../configuration-app-details-form/configuration-app-details-form';

@Component({
  selector: 'core-configuration-app-details-dialog',
  templateUrl: './configuration-app-details-dialog.html',
  styleUrl: './configuration-app-details-dialog.scss',
  imports: [DialogTemplate, ConfigurationAppDetailsForm, TranslatePipe, MatButtonModule],
})
export class ConfigurationAppDetailsDialog extends DialogBase implements OnInit {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);
  private readonly configurationAppDetailsFormConfig = inject(ConfigurationAppDetailsFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup: FormGroup<TConfigurationAppDetailsForm> =
    this.configurationAppDetailsFormConfig.getFormGroup();
  appName: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.appName.set(this.data.app.name || '');

    this.formGroup.patchValue({
      keyCode: this.data.app.keyCode?.toString() ?? '',
      longTap: this.data.app.longTap,
      bottom: this.data.app.bottom,
    });
  }

  override onSave(): void {}

  onFormChange(value: TConfigurationAppDetailsFormValue): void {
    this.configurationAppsFacadeService.updateAppDetails(this.data.app, value);
  }
}
