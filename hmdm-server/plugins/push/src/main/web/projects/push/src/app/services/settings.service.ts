import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http: HttpClient = inject(HttpClient);

  purgeMessages(days: number): Observable<void> {
    return this.http
      .get<THttpResponse<void>>(`rest/private/plugin-push/purge/${days}`)
      .pipe(map((res) => res.data));
  }
}
