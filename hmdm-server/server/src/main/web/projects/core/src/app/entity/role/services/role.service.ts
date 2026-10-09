import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TCreateRoleRequest } from '../types/create-role-request.type';
import { TPermissionDTO } from '../types/permission-dto.type';
import { TRoleDTO } from '../types/role-dto.type';
import { TUpdateRoleRequest } from '../types/update-role-request.type';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http: HttpClient = inject(HttpClient);

  getRoles(): Observable<TRoleDTO[]> {
    return this.http
      .get<THttpResponse<TRoleDTO[]>>('rest/private/roles/all')
      .pipe(map((response) => response.data));
  }

  getUserRoles(): Observable<TRoleDTO[]> {
    return this.http
      .get<THttpResponse<TRoleDTO[]>>('rest/private/users/roles')
      .pipe(map((response) => response.data));
  }

  createRole(body: TCreateRoleRequest): Observable<TRoleDTO> {
    return this.http
      .put<THttpResponse<TRoleDTO>>('rest/private/roles', body)
      .pipe(map((response) => response.data));
  }

  updateRole(body: TUpdateRoleRequest): Observable<TRoleDTO> {
    return this.http
      .put<THttpResponse<TRoleDTO>>('rest/private/roles', body)
      .pipe(map((response) => response.data));
  }

  getPermissions(): Observable<TPermissionDTO[]> {
    return this.http
      .get<THttpResponse<TPermissionDTO[]>>('rest/private/roles/permissions')
      .pipe(map((response) => response.data));
  }

  deleteRole(roleId: number): Observable<void> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/roles/${roleId}`)
      .pipe(map((response) => response.data));
  }
}
