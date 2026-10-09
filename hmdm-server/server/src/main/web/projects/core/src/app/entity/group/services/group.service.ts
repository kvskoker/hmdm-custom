import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TGroupFormValue } from '../../../settings/types/group-form.type';
import { TGroupDTO } from '../types/group-dto.type';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private http: HttpClient = inject(HttpClient);

  searchGroups(term?: string): Observable<TGroupDTO[]> {
    const url = term
      ? `rest/private/groups/search/${encodeURIComponent(term)}`
      : 'rest/private/groups/search';

    return this.http.get<THttpResponse<TGroupDTO[]>>(url).pipe(map((response) => response.data));
  }

  createGroup(body: TGroupFormValue): Observable<void> {
    return this.http.put<THttpResponse<void>>('rest/private/groups', body).pipe(map(() => {}));
  }

  updateGroup(body: TGroupDTO): Observable<void> {
    return this.http.put<THttpResponse<void>>('rest/private/groups', body).pipe(map(() => {}));
  }

  deleteGroup(groupId: number): Observable<void> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/groups/${groupId}`)
      .pipe(map(() => {}));
  }
}
