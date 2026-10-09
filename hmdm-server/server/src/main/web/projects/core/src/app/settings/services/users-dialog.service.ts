import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap, take } from 'rxjs';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { TUserDTO } from '../../entity/user/types/user-dto.type';
import { AuthService } from '../../shared/services/auth.service';
import { UserDialog } from '../components/user-dialog/user-dialog';
import { UsersFacadeService } from './users-facade.service';

@Injectable({
  providedIn: 'root',
})
export class UsersDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly userFacadeService = inject(UsersFacadeService);
  private readonly authService = inject(AuthService);

  openAddUser(): void {
    this.dialog
      .open(UserDialog, { width: '400px' })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((value) => this.userFacadeService.createUser(value)),
      )
      .subscribe(() => this.userFacadeService.searchUsers());
  }

  openEditUser(user: TUserDTO): void {
    this.dialog
      .open(UserDialog, { data: { user }, width: '400px' })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((value) => this.userFacadeService.updateUser(user, value)),
      )
      .subscribe(() => this.userFacadeService.searchUsers());
  }

  openDeleteUser(user: TUserDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.user',
          params: { username: user.name },
          confirmButtonText: 'button.delete',
        },
        width: '400px',
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.userFacadeService.deleteUser(user.id)),
      )
      .subscribe(() => this.userFacadeService.searchUsers());
  }

  openImpersonateUser(user: TUserDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.change.user',
          params: { userName: user.name },
          confirmButtonText: 'button.login',
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.userFacadeService.impersonateUser(user.id)),
        switchMap(() => this.authService.getCurrentUser()),
        switchMap(() => this.authService.init()),
      )
      .subscribe(() => {});
  }
}
