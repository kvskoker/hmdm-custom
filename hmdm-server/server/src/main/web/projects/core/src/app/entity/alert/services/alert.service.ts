import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {TAlertResponse} from '../types/alert-dto.type';
import {THttpResponse} from 'hmdm-ui-kit';
import {TAlertBodyDTO} from '../types/alert-body-dto.type';

@Injectable({providedIn: 'root'})
export class AlertService {
  private readonly http = inject(HttpClient);
  private readonly searchUrl = `rest/private/alert/search`;

  getAlertsHttp(body: TAlertBodyDTO) {
    return this.http.post<THttpResponse<TAlertResponse>>(
      this.searchUrl,
      {...body}
    ).pipe(
      map((response) => response.data)
    );
  }
}
