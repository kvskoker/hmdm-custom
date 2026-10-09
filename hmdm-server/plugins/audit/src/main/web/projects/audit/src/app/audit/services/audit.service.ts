import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse } from 'hmdm-ui-kit';
import { Observable } from 'rxjs';
import { TAuditDTO } from '../types/audit-dto.type';
import { TGetAllAuditsRequest } from '../types/get-all-audits-request.type';

@Injectable()
export class AuditService {
  private http: HttpClient = inject(HttpClient);

  getAllAudits(body: TGetAllAuditsRequest): Observable<THttpPageableResponse<TAuditDTO>> {
    return this.http.post<THttpPageableResponse<TAuditDTO>>(
      'rest/private/plugin-audit/search',
      body,
    );
  }
}
