import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TCreateIconRequest } from '../types/create-icon-request.type';
import { TIconDto } from '../types/icon-dto.type';

@Injectable({ providedIn: 'root' })
export class IconService {
  private http: HttpClient = inject(HttpClient);

  searchIcons(term?: string): Observable<TIconDto[]> {
    const url = term
      ? `rest/private/icons/search/${encodeURIComponent(term)}`
      : 'rest/private/icons/search';

    return this.http.get<THttpResponse<TIconDto[]>>(url).pipe(map((response) => response.data));
  }

  createIcon(body: TCreateIconRequest): Observable<THttpResponse<void>> {
    return this.http.put<THttpResponse<void>>('rest/private/icons', body);
  }

  updateIcon(body: TIconDto): Observable<THttpResponse<void>> {
    return this.http.put<THttpResponse<void>>('rest/private/icons', body);
  }

  deleteIcon(iconId: number): Observable<THttpResponse<void>> {
    return this.http.delete<THttpResponse<void>>(`rest/private/icons/${iconId}`);
  }
}
