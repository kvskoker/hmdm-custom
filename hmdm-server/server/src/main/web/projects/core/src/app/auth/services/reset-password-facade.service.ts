import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { SettingsService } from '../../entity/settings/services/settings.service';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordFacadeService {
  private readonly settingsService = inject(SettingsService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly authService = inject(AuthService);

  loadSettings(token: string): Observable<void> {
    return this.settingsService.getPublicPasswordResetSettings(token).pipe(
      tap((settings) => {
        this.settingsFacadeService.settings.set(settings);
      }),
      map(() => void 0),
    );
  }

  reset(token: string, newPassword: string): Observable<void> {
    return this.authService.resetPassword(token, newPassword);
  }
}
