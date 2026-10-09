import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse, THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TMessageDTO } from '../types/message-dto.type';
import { TSearchMessageRequest } from '../types/search-message-request.type';
import { TMessageFormValue } from '../types/message-form.type';

@Injectable({
  providedIn: 'root',
})
export class PushService {
  private readonly http: HttpClient = inject(HttpClient);

  search(
    body: TSearchMessageRequest,
  ): Observable<{ items: TMessageDTO[]; totalItemsCount: number }> {
    return this.http
      .post<
        THttpPageableResponse<TMessageDTO>
      >('rest/private/plugin-push/search', body)
      .pipe(
        map((response) => ({
          items: response.data.items,
          totalItemsCount: response.data.totalItemsCount,
        })),
      );
  }

  pushMessage(message: TMessageFormValue): Observable<void> {
    return this.http
      .post<THttpResponse<void>>('rest/private/plugin-push/send', message)
      .pipe(map((response) => response.data));
  }
}
