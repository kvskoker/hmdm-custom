import { computed, inject, Injectable } from '@angular/core';
import { TOption } from 'hmdm-ui-kit';
import { DESKTOP_OPTIONS } from '../../configurations/const/desktop-options.const';
import { SettingsFacadeService } from './settings-facade.service';

@Injectable({ providedIn: 'root' })
export class DesktopOptionsService {
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly settings = this.settingsFacadeService.settings;

  desktopOptions = computed(() => {
    const settings = this.settings();

    const options = [...DESKTOP_OPTIONS];

    if (settings?.customPropertyName1) {
      options.push({
        value: 'CUSTOM1',
        viewValue: settings.customPropertyName1,
      });
    }

    if (settings?.customPropertyName2) {
      options.push({
        value: 'CUSTOM2',
        viewValue: settings.customPropertyName2,
      });
    }

    if (settings?.customPropertyName3) {
      options.push({
        value: 'CUSTOM3',
        viewValue: settings.customPropertyName3,
      });
    }

    return options;
  });

  getOptions(): TOption<string>[] {
    return [...DESKTOP_OPTIONS];
  }
}
