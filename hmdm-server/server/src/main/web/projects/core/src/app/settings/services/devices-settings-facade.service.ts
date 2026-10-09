import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SettingsService } from '../../entity/settings/services/settings.service';
import { TDevicesSettingsDTO } from '../../entity/settings/types/devices-settings-dto.type';
import { SnackBarService } from '../../shared/services/snack-bar.service';

@Injectable({
  providedIn: 'root',
})
export class DevicesSettingsFacadeService {
  private readonly settingsService = inject(SettingsService);
  private readonly snackbarService = inject(SnackBarService);

  getDevicesSettingsByRole(roleId: number) {
    return this.settingsService.getDevicesSettingsByRole(roleId);
  }

  updateDevicesSettings(settings: TDevicesSettingsDTO): Observable<void> {
    return this.settingsService.updateDevicesSettings(settings).pipe(
      tap(() => {
        this.snackbarService.success('success.settings.common.saved');
      }),
    );
  }
}
