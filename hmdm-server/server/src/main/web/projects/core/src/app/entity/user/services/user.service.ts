import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { THttpResponse } from '../../../shared/types/http-response.type';
import { TUserDTO } from '../types/user-dto.type';
import { TCreateUserRequest } from '../types/create-user.request.type';
import { TRoleDTO } from '../../role/types/role-dto.type';
import { TUpdateUserRequest } from '../types/update-user.request.type';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http: HttpClient = inject(HttpClient);

  getCurrentUser(): Observable<TUserDTO> {
    return this.http
      .get<THttpResponse<TUserDTO>>('rest/private/users/current')
      .pipe(map((response) => response.data));
  }

  getUsersRoles(): Observable<TRoleDTO[]> {
    return this.http
      .get<THttpResponse<TRoleDTO[]>>('rest/private/users/roles')
      .pipe(map((response) => response.data));
  }

  searchUsers(term: string): Observable<TUserDTO[]> {
    return this.http
      .get<THttpResponse<TUserDTO[]>>('rest/private/users/all', {
        params: { filter: term },
      })
      .pipe(map((response) => response.data));
  }

  createUser(body: TCreateUserRequest): Observable<TUserDTO> {
    return this.http
      .put<THttpResponse<TUserDTO>>('rest/private/users', body)
      .pipe(map((response) => response.data));
  }

  updateUser(body: TUpdateUserRequest): Observable<TUserDTO> {
    return this.http
      .put<THttpResponse<TUserDTO>>('rest/private/users', body)
      .pipe(map((response) => response.data));
  }

  updateDetails(body: TUpdateUserRequest): Observable<TUserDTO> {
    return this.http
      .put<THttpResponse<TUserDTO>>('rest/private/users/details', body)
      .pipe(map((response) => response.data));
  }

  updatePassword(body: TUpdateUserRequest): Observable<TUserDTO> {
    return this.http
      .put<THttpResponse<TUserDTO>>('rest/private/users/current', body)
      .pipe(map((response) => response.data));
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`rest/private/users/other/${userId}`);
  }

  impersonateUser(userId: number): Observable<void> {
    return this.http.get<void>(`rest/private/users/impersonate/${userId}`);
  }

  getUsersBySuperAdmin(customerId: number): Observable<TUserDTO[]> {
    return this.http
      .get<THttpResponse<TUserDTO[]>>(`rest/private/users/superadmin/all/${customerId}`)
      .pipe(map((response) => response.data));
  }

  updatePasswordBySuperAdmin(body: { id: number; newPassword: string }): Observable<void> {
    return this.http
      .put<THttpResponse<void>>('rest/private/users/superadmin/password', body)
      .pipe(map(() => void 0));
  }
}
