import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TLogsDTO } from '../types/logs-dto.type';
import { TSearchRequestBody } from '../types/search-logs-request.type';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  private readonly http: HttpClient = inject(HttpClient);

  search(body: TSearchRequestBody): Observable<{ items: TLogsDTO[]; totalItemsCount: number }> {
    return this.http
      .post<
        THttpPageableResponse<TLogsDTO>
      >('rest/private/plugin-devicelog/search', body)
      .pipe(
        map((response) => ({
          items: response.data.items,
          totalItemsCount: response.data.totalItemsCount,
        })),
      );
  }

  export(body: TSearchRequestBody): Observable<string> {
    return this.http.post('rest/private/plugin-devicelog/export', body, {
      responseType: 'text',
    });
  }
}
