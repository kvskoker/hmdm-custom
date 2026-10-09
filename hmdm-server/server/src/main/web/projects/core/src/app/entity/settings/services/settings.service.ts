import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { forkJoin, map, Observable } from 'rxjs';
import { TDevicesSettingsDTO } from '../types/devices-settings-dto.type';
import { TSettingsDTO } from '../types/settings-dto.type';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private http: HttpClient = inject(HttpClient);

  getSettings(): Observable<TSettingsDTO> {
    return this.http
      .get<THttpResponse<TSettingsDTO>>('rest/private/settings')
      .pipe(map((response) => response.data));
  }

  getPublicPasswordResetSettings(token: string): Observable<TSettingsDTO> {
    return this.http
      .get<THttpResponse<TSettingsDTO>>(`rest/public/passwordReset/settings/${token}`)
      .pipe(map((response) => response.data));
  }

  updateSettings(settings: TSettingsDTO): Observable<void> {
    return forkJoin([
      this.http.post<THttpResponse<void>>('rest/private/settings/misc', settings),
      this.http.post<THttpResponse<void>>('rest/private/settings/lang', settings),
    ]).pipe(map(() => void 0));
  }

  getDevicesSettingsByRole(roleId: number): Observable<TDevicesSettingsDTO> {
    return this.http
      .get<THttpResponse<TDevicesSettingsDTO>>(`rest/private/settings/userRole/${roleId}`)
      .pipe(map((response) => response.data));
  }

  updateDevicesSettings(settings: TDevicesSettingsDTO): Observable<void> {
    return this.http
      .post<THttpResponse<void>>('rest/private/settings/userRoles/common', [settings])
      .pipe(map(() => void 0));
  }
}
