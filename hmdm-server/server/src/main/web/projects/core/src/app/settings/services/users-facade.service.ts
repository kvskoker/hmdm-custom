import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { finalize, forkJoin, map, Observable, switchMap, take } from 'rxjs';
import { TOption } from 'hmdm-ui-kit';
import { TRoleDTO } from '../../entity/role/types/role-dto.type';
import { UserService } from '../../entity/user/services/user.service';
import { TCreateUserRequest } from '../../entity/user/types/create-user.request.type';
import { TUserDTO } from '../../entity/user/types/user-dto.type';
import { AuthService } from '../../shared/services/auth.service';
import { TUserFormValue } from '../types/user-form.type';
import { TUpdateUserRequest } from '../../entity/user/types/update-user.request.type';

@Injectable({
  providedIn: 'root',
})
export class UsersFacadeService {
  private readonly userService: UserService = inject(UserService);
  private readonly authService = inject(AuthService);

  private readonly _users: WritableSignal<TUserDTO[]> = signal([]);
  private readonly _userRoles: WritableSignal<TRoleDTO[]> = signal([]);
  private searchterm: string = '';

  users = this._users.asReadonly();
  userRoles = this._userRoles.asReadonly();
  userRoleOptions: Signal<TOption<number>[]> = computed(() =>
    this._userRoles().map((role) => ({
      value: role.id,
      viewValue: role.name,
    })),
  );
  isLoadingUsers = signal(false);

  constructor() {
    this.searchUsers();
    this.fetchUserRoles();
  }

  fetchUserRoles() {
    this.userService
      .getUsersRoles()
      .pipe(take(1))
      .subscribe((roles) => {
        this._userRoles.set(roles);
      });
  }

  updateSearchTerm(term: string): void {
    this.searchterm = term;
  }

  searchUsers(): void {
    this.isLoadingUsers.set(true);
    this.userService
      .searchUsers(this.searchterm)
      .pipe(
        take(1),
        finalize(() => this.isLoadingUsers.set(false)),
      )
      .subscribe((users) => {
        this._users.set(users);
      });
  }

  createUser(value: TUserFormValue): Observable<TUserDTO> {
    return forkJoin({
      newPassword: this.authService.preparePassword(value.newPassword),
      confirmModal: this.authService.preparePassword(value.confirm),
    }).pipe(
      take(1),
      map(({ newPassword, confirmModal }) => {
        const createUserRequest: TCreateUserRequest = {
          name: value.name,
          email: value.email,
          login: value.login,
          userRole: { id: value.userRole! },
          allConfigAvailable: value.allConfigAvailable,
          allDevicesAvailable: value.allDevicesAvailable,
          configurations: value.allConfigAvailable
            ? []
            : value.configurations.map((id) => ({ id })),
          groups: value.allDevicesAvailable ? [] : value.groups.map((id) => ({ id })),
          confirm: '',
          newPassword,
          confirmModal,
          alertLevel: value.alertLevel,
        };

        return createUserRequest;
      }),
      switchMap((createUserRequest) => this.userService.createUser(createUserRequest)),
    );
  }

  updateUser(user: TUserDTO, value: TUserFormValue): Observable<TUserDTO> {
    if (value.newPassword) {
      return this.updateUserWithPassword(user, value);
    } else {
      return this.updateUserWithoutPassword(user, value);
    }
  }

  deleteUser(userId: number): Observable<void> {
    return this.userService.deleteUser(userId);
  }

  impersonateUser(userId: number): Observable<void> {
    return this.userService.impersonateUser(userId);
  }

  private updateUserWithoutPassword(user: TUserDTO, value: TUserFormValue): Observable<TUserDTO> {
    const updateUserRequest: TUpdateUserRequest = {
      ...user,
      login: value.login,
      name: value.name,
      email: value.email,
      allConfigAvailable: value.allConfigAvailable,
      allDevicesAvailable: value.allDevicesAvailable,
      configurations: value.allConfigAvailable ? [] : value.configurations.map((id) => ({ id })),
      groups: value.allDevicesAvailable ? [] : value.groups.map((id) => ({ id })),
      userRole: { id: value.userRole! },
      alertLevel: value.alertLevel,
    };

    return this.userService.updateUser(updateUserRequest);
  }

  private updateUserWithPassword(user: TUserDTO, value: TUserFormValue): Observable<TUserDTO> {
    return forkJoin({
      newPassword: this.authService.preparePassword(value.newPassword),
      confirmModal: this.authService.preparePassword(value.confirm),
    }).pipe(
      take(1),
      map(({ newPassword, confirmModal }) => {
        const updateUserRequest: TUpdateUserRequest = {
          ...user,
          login: value.login,
          name: value.name,
          email: value.email,
          allConfigAvailable: value.allConfigAvailable,
          allDevicesAvailable: value.allDevicesAvailable,
          configurations: value.allConfigAvailable
            ? []
            : value.configurations.map((id) => ({ id })),
          groups: value.allDevicesAvailable ? [] : value.groups.map((id) => ({ id })),
          userRole: { id: value.userRole! },
          newPassword,
          confirmModal,
          confirm: '',
          alertLevel: value.alertLevel,
        };

        return updateUserRequest;
      }),
      switchMap((updateUserRequest) => this.userService.updateUser(updateUserRequest)),
    );
  }
}
