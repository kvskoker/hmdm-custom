import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, switchMap, take } from 'rxjs';
import { TRoleDTO } from '../../entity/role/types/role-dto.type';
import { RoleDialog } from '../components/role-dialog/role-dialog';
import { RoleFacadeService } from './role-facade.service';
import { UsersFacadeService } from './users-facade.service';

@Injectable({
  providedIn: 'root',
})
export class RolesDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly roleFacadeService: RoleFacadeService = inject(RoleFacadeService);
  private readonly usersFacadeService: UsersFacadeService = inject(UsersFacadeService);

  openAddRole(): void {
    this.dialog
      .open(RoleDialog, { width: '600px' })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((roleData) => this.roleFacadeService.createRole(roleData)),
      )
      .subscribe(() => this.reloadRoles());
  }

  openEditRole(role: TRoleDTO): void {
    this.dialog
      .open(RoleDialog, {
        width: '600px',
        data: { role },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((roleData) => {
          return this.roleFacadeService.updateRole(role.id, roleData);
        }),
      )
      .subscribe(() => this.reloadRoles());
  }

  private reloadRoles(): void {
    this.roleFacadeService.loadRoles();
    this.usersFacadeService.fetchUserRoles();
  }

  openDeleteRole(role: TRoleDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.role',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: { roleName: role.name },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.roleFacadeService.deleteRole(role.id)),
      )
      .subscribe(() => this.reloadRoles());
  }
}
