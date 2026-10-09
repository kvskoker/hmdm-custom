import { Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BaseComponent,
  Checkbox,
  ColorInputComponent,
  Selector,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { DesktopOptionsService } from '../../../shared/services/desktop-options.service';
import { ConfigurationDesignFormConfig } from '../../configs/configuration-design-form.config';
import { ICON_SIZE_OPTIONS } from '../../const/icon-size-options.const';
import { ORIENTATION_OPTIONS } from '../../const/orientation-options.const';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';
import { TConfigurationDesignFormValue } from '../../types/configuration-design-form.type';

@Component({
  selector: 'core-configuration-design',
  templateUrl: './configuration-design.html',
  styleUrl: './configuration-design.scss',
  imports: [
    ReactiveFormsModule,
    Checkbox,
    TextInputComponent,
    Selector,
    TranslatePipe,
    ColorInputComponent,
  ],
})
export class ConfigurationDesign extends BaseComponent implements OnInit {
  private readonly configurationDesignFormConfig = inject(ConfigurationDesignFormConfig);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);
  private readonly desktopOptionsService = inject(DesktopOptionsService);

  iconSizeOptions = ICON_SIZE_OPTIONS;
  desktopOptions = this.desktopOptionsService.desktopOptions;
  orientationOptions = ORIENTATION_OPTIONS;
  formGroup = this.configurationDesignFormConfig.getFormGroup();

  get formValue(): TConfigurationDesignFormValue {
    return this.formGroup.getRawValue();
  }

  constructor() {
    super();

    effect(() => {
      const config = this.configurationDetailsFacadeService.currentConfiguration();

      if (config) {
        this.formGroup.patchValue(config, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.initFormListeners();
  }

  private initFormListeners(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationDetailsFacadeService.setConfigurationDesign(this.formValue);
    });
  }
}
