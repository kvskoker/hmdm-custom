import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { TSettingsDTO } from '../types/settings-dto.type';
import { SettingsService } from './settings.service';
import { TSettingsFormValue } from '../types/settings-form.type';

@Injectable({
  providedIn: 'root',
})
export class SettingsFacadeService {
  private readonly settingsService = inject(SettingsService);
  private readonly _settings: WritableSignal<TSettingsDTO | null> = signal(null);

  readonly settings: Signal<TSettingsDTO | null> = this._settings.asReadonly();
  readonly isLoadingSettings: WritableSignal<boolean> = signal(false);

  constructor() {
    this.fetchSettings();
  }

  saveSettings(form: TSettingsFormValue): void {
    this.isLoadingSettings.set(true);

    const current = this._settings();
    if (!current) {
      return;
    }

    const body: TSettingsDTO = {
      ...current,
      intervalMins: form.intervalMins,
      dataPreservePeriod: form.dataPreservePeriod,
      sendData: form.sendData,
    };

    this.settingsService
      .saveSettings(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingSettings.set(false)),
      )
      .subscribe(() => {
        this._settings.set(body);
      });
  }

  private fetchSettings(): void {
    this.isLoadingSettings.set(true);

    this.settingsService
      .fetchSettings()
      .pipe(
        take(1),
        finalize(() => this.isLoadingSettings.set(false)),
      )
      .subscribe((settings) => {
        this._settings.set(settings);
      });
  }
}
