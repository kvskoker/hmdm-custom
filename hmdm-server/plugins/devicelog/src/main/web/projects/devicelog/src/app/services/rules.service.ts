import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TRuleResponse } from '../types/rule-response.type';

@Injectable({
  providedIn: 'root',
})
export class RulesService {
  private readonly http: HttpClient = inject(HttpClient);

  search(): Observable<TRuleResponse> {
    return this.http
      .get<THttpResponse<TRuleResponse>>(`rest/private/plugin-devicelog/settings`)
      .pipe(map((res) => res.data));
  }

  delete(id: number) {
    return this.http.delete<void>(`rest/private/plugin-devicelog/delete/${id}`);
  }

  create(data: any) {
    return this.http.put<void>(
      `rest/private/plugin-devicelog/settings/rule`,
      data,
    );
  }

  edit(data: any) {
    return this.http.put<void>(
      `rest/private/plugin-devicelog/settings/rule`,
      data,
    );
  }
}
