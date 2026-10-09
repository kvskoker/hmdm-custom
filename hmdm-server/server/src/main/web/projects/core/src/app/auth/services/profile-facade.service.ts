import { inject, Injectable } from '@angular/core';
import { forkJoin, map, switchMap, take } from 'rxjs';
import { UserService } from '../../entity/user/services/user.service';
import { TUpdateUserRequest } from '../../entity/user/types/update-user.request.type';
import { AuthService } from '../../shared/services/auth.service';
import { TProfilePasswordFormValue } from '../types/profile-password-form.type';
import { TProfileUserFormValue } from '../types/profile-user-form.type';

@Injectable({
  providedIn: 'root',
})
export class ProfileFacadeService {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  updateProfile(value: TProfileUserFormValue): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    this.userService
      .updateDetails({
        ...currentUser,
        login: value.login,
        name: value.name,
        email: value.email,
        configurations: currentUser.configurations.map((config) => ({ id: config.id })),
        groups: currentUser.groups.map((group) => ({ id: group.id })),
        passwordReset: false,
      })
      .pipe(
        take(1),
        switchMap(() => this.authService.getCurrentUser()),
      )
      .subscribe();
  }

  changePassword(value: TProfilePasswordFormValue): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      return;
    }

    console.log('value', value);

    forkJoin({
      newPassword: this.authService.preparePassword(value.newPassword),
      oldPassword: this.authService.preparePassword(value.oldPassword),
    })
      .pipe(
        take(1),
        map(({ newPassword, oldPassword }) => {
          const updateUserRequest: TUpdateUserRequest = {
            ...currentUser,
            newPassword,
            oldPassword,
            confirm: '',
          };
          return updateUserRequest;
        }),
        switchMap((updateUserRequest) => this.userService.updatePassword(updateUserRequest)),
        switchMap(() => this.authService.logout()),
      )
      .subscribe();
  }
}
