import { Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BaseComponent,
  Checkbox,
  Selector,
  SelectSearch,
  TextAreaInputComponent,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { ConfigurationMdmFormConfig } from '../../configs/configuration-mdm-form.config';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';
import { TConfigurationMDMForm } from '../../types/configuration-mdm-form.type';
import { WIFI_SECURITY_OPTIONS } from '../../const/wifi-security-options.const';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-configuration-mdm',
  templateUrl: './configuration-mdm.html',
  styleUrl: './configuration-mdm.scss',
  imports: [
    Checkbox,
    SelectSearch,
    TextInputComponent,
    TranslatePipe,
    Selector,
    TextAreaInputComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ConfigurationMdm extends BaseComponent implements OnInit {
  private readonly configurationMdmFormConfig: ConfigurationMdmFormConfig = inject(
    ConfigurationMdmFormConfig,
  );
  private readonly configurationDetailsFacadeService: ConfigurationDetailsFacadeService = inject(
    ConfigurationDetailsFacadeService,
  );
  private readonly configurationApplicationsFacadeService: ConfigurationAppsFacadeService = inject(
    ConfigurationAppsFacadeService,
  );

  wifiSecurityOptions = WIFI_SECURITY_OPTIONS;
  applicationOptions = this.configurationApplicationsFacadeService.applicationsVersionIdOptions;
  formGroup: FormGroup<TConfigurationMDMForm> = this.configurationMdmFormConfig.getFormGroup();
  isKioskMode: WritableSignal<boolean> = signal(false);

  constructor() {
    super();

    effect(() => {
      const currentConfig = this.configurationDetailsFacadeService.currentConfiguration();
      if (!currentConfig) {
        return;
      }

      this.formGroup.patchValue(
        {
          kioskMode: currentConfig?.kioskMode || false,
          mainAppId: currentConfig?.mainAppId || null,
          contentAppId: currentConfig?.contentAppId || null,
          eventReceivingComponent: currentConfig?.eventReceivingComponent || '',

          kioskHome: currentConfig?.kioskHome || false,
          kioskRecents: currentConfig?.kioskRecents || false,
          kioskNotifications: currentConfig?.kioskNotifications || false,
          kioskSystemInfo: currentConfig?.kioskSystemInfo || false,
          kioskKeyguard: currentConfig?.kioskKeyguard || false,
          kioskLockButtons: currentConfig?.kioskLockButtons || false,
          kioskExit: currentConfig?.kioskExit || false,
          kioskScreenOn: currentConfig?.kioskScreenOn || false,

          permissive: currentConfig.permissive || false,
          lockSafeSettings: currentConfig.lockSafeSettings || false,
          allowedClasses: currentConfig.allowedClasses || '',

          wifiSSID: currentConfig.wifiSSID || '',
          wifiPassword: currentConfig.wifiPassword || '',
          wifiSecurityType: currentConfig.wifiSecurityType || '',

          qrParameters: currentConfig.qrParameters || '',
          mobileEnrollment: currentConfig.mobileEnrollment || false,
          encryptDevice: currentConfig.encryptDevice || false,

          restrictions: currentConfig.restrictions || '',
          newServerUrl: currentConfig.newServerUrl || '',
        },
        { emitEvent: false },
      );

      this.isKioskMode.set(this.formGroup.controls.kioskMode.value);
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationDetailsFacadeService.setMDMSettings(this.formGroup.getRawValue());
      this.isKioskMode.set(this.formGroup.controls.kioskMode.value);
    });

    this.isKioskMode.set(this.formGroup.controls.kioskMode.value);
  }
}
