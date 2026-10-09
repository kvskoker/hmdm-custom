import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http: HttpClient = inject(HttpClient);

  preserveMessages(days: number): Observable<void> {
    return this.http
      .put<
        THttpResponse<void>
      >(`rest/private/plugin-devicelog/settings`, { logsPreservePeriod: days })
      .pipe(map((res) => res.data));
  }
}
