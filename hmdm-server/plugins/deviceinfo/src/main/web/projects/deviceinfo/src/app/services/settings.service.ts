import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TSettingsDTO } from '../types/settings-dto.type';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http: HttpClient = inject(HttpClient);

  saveSettings(body: TSettingsDTO): Observable<void> {
    return this.http.put<void>('rest/private/plugin-deviceinfo/settings', body);
  }

  fetchSettings(): Observable<TSettingsDTO> {
    return this.http
      .get<
        THttpResponse<TSettingsDTO>
      >('rest/private/plugin-deviceinfo/settings')
      .pipe(map((response) => response.data));
  }
}
