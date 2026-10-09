import { Component, inject, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, Selector, TOption } from 'hmdm-ui-kit';
import { ConfigurationBulkFormConfig } from '../../configuration/configuration-bulk-form.config';
import { DevicesFacadeService } from '../../services/devices-facade.service';

@Component({
  selector: 'core-configuration-bulk-dialog',
  templateUrl: './configuration-bulk-dialog.html',
  styleUrl: './configuration-bulk-dialog.scss',
  imports: [
    DialogTemplate,
    Selector,
    ReactiveFormsModule,
    MatButtonModule,
    TranslatePipe,
    DialogCommonButtons,
  ],
})
export class ConfigurationBulkDialog extends DialogBase {
  private readonly deviceFacadeService = inject(DevicesFacadeService);
  private readonly configurationBulkFormConfig = inject(ConfigurationBulkFormConfig);

  configurationOptions: Signal<TOption<number>[]> = this.deviceFacadeService.configurations;
  formGroup = this.configurationBulkFormConfig.getFormGroup();

  override onSave(): void {
    this.dialogRef.close(this.formGroup.value);
  }
}
