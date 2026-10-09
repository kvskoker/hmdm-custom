import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { THttpResponse } from '../../../shared/types/http-response.type';
import { TSummaryResponse } from '../types/summary-response.type';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http: HttpClient = inject(HttpClient);

  getSummary(): Observable<TSummaryResponse> {
    return this.http
      .get<THttpResponse<TSummaryResponse>>('rest/private/summary/devices')
      .pipe(map((response) => response.data));
  }
}
