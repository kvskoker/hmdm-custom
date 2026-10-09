import { Component, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Selector, TextAreaInputComponent, TextInputComponent } from 'hmdm-ui-kit';
import { MASKS } from '../../../shared/const/masks.const';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { DeviceFormConfig } from '../../configuration/device-form.config';
import { DevicesFacadeService } from '../../services/devices-facade.service';
import { TDeviceFormValue } from '../../types/device-form-value.type';
import { TDevice } from '../../types/device.type';

@Component({
  selector: 'core-device-form',
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
  imports: [
    TextInputComponent,
    TextAreaInputComponent,
    Selector,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class DeviceForm {
  initialData: InputSignal<TDevice | null> = input<TDevice | null>(null);

  formChange: OutputEmitterRef<TDeviceFormValue> = output();

  private readonly deviceFormConfig: DeviceFormConfig = inject(DeviceFormConfig);
  private readonly devicesFacadeService = inject(DevicesFacadeService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  readonly MASKS = MASKS;
  settings = this.settingsFacadeService.settings;
  formGroup = this.deviceFormConfig.getFormGroup();
  groupOptions = this.devicesFacadeService.groups;
  configurationOptions = this.devicesFacadeService.configurations;
  phoneMask = this.settingsFacadeService.phoneMask;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const data = this.initialData();

    if (data) {
      this.formGroup.controls.number.setValue(data.number);
      this.formGroup.controls.description.setValue(data.description);
      this.formGroup.controls.imei.setValue(data.imei);
      this.formGroup.controls.phone.setValue(data.phone);
      this.formGroup.controls.custom1.setValue(data.custom1 ?? '');
      this.formGroup.controls.custom2.setValue(data.custom2 ?? '');
      this.formGroup.controls.custom3.setValue(data.custom3 ?? '');
      this.formGroup.controls.configurationId.setValue(data.configuration.id ?? null);
      this.formGroup.controls.groups.setValue(data.groups.map((group) => group.id));
    }

    this.formGroup.valueChanges.subscribe(() => {
      this.formChange.emit(this.formGroup.getRawValue());
    });
  }
}
