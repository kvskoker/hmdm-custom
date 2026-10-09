import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse, THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TMessageDTO } from '../types/message-dto.type';
import { TMessageFormValue } from '../types/message-form.type';
import { TSearchRequestBody } from '../types/search-request-body.type';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private readonly http: HttpClient = inject(HttpClient);

  search(body: TSearchRequestBody): Observable<{ items: TMessageDTO[]; totalItemsCount: number }> {
    return this.http
      .post<
        THttpPageableResponse<TMessageDTO>
      >('rest/private/plugin-messaging/search', body)
      .pipe(
        map((response) => ({
          items: response.data.items,
          totalItemsCount: response.data.totalItemsCount,
        })),
      );
  }

  sendMessage(body: TMessageFormValue): Observable<void> {
    return this.http
      .post<THttpResponse<void>>('rest/private/plugin-messaging/send', body)
      .pipe(map((res) => res.data));
  }

  purgeMessages(days: number): Observable<void> {
    return this.http
      .get<THttpResponse<void>>(`rest/private/plugin-messaging/purge/${days}`)
      .pipe(map((res) => res.data));
  }
}
