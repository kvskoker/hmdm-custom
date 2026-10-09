import { inject, Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsFacadeService {
  private readonly settingsService: SettingsService = inject(SettingsService);

  preserveMessages(days: number): Observable<void> {
    return this.settingsService.preserveMessages(days);
  }
}
