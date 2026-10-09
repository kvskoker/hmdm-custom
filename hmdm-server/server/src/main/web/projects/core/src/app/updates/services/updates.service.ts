import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {THttpResponse} from 'hmdm-ui-kit';
import {TAppUpdate, TUpdateForm} from '../types/updates.types';

@Injectable({
  providedIn: 'root',
})
export class UpdatesService {
  private readonly http = inject(HttpClient);

  checkUpdates(): Observable<THttpResponse<TAppUpdate[]>> {
    return this.http.get<THttpResponse<TAppUpdate[]>>('rest/private/update/check');
  }

  getUpdates(form: TUpdateForm): Observable<THttpResponse<TAppUpdate[]>> {
    return this.http.post<THttpResponse<TAppUpdate[]>>('rest/private/update', form);
  }
}
