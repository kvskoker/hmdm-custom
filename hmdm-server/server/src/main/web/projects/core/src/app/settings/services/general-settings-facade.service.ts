import { inject, Injectable } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { SettingsService } from '../../entity/settings/services/settings.service';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { TGeneralSettingsFormValue } from '../types/general-settings-form.type';

@Injectable({
  providedIn: 'root',
})
export class GeneralSettingsFacadeService {
  private readonly settingsService = inject(SettingsService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);

  updateSettings(settings: TGeneralSettingsFormValue): void {
    this.settingsService
      .updateSettings({
        ...this.settingsFacadeService.settings()!,
        ...settings,
      })
      .pipe(
        switchMap(() => this.settingsFacadeService.fetchSettings()),
        take(1),
      )
      .subscribe();
  }
}
