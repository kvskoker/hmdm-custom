import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { TOption } from 'hmdm-ui-kit';
import { finalize, Observable, take } from 'rxjs';
import { RoleService } from '../../entity/role/services/role.service';
import { TCreateRoleRequest } from '../../entity/role/types/create-role-request.type';
import { TPermissionDTO } from '../../entity/role/types/permission-dto.type';
import { TRoleDTO } from '../../entity/role/types/role-dto.type';
import { TUpdateRoleRequest } from '../../entity/role/types/update-role-request.type';
import { TRoleFormValue } from '../types/role-form.type';

@Injectable({
  providedIn: 'root',
})
export class RoleFacadeService {
  private readonly roleService = inject(RoleService);

  private readonly _roles: WritableSignal<TRoleDTO[]> = signal([]);
  private readonly _userRoles: WritableSignal<TRoleDTO[]> = signal([]);
  private readonly _permissions: WritableSignal<TPermissionDTO[]> = signal([]);

  roles = this._roles.asReadonly();
  permissions = this._permissions.asReadonly();
  permissionOptions: Signal<TOption<number>[]> = computed(() =>
    this._permissions().map((permission) => ({
      value: permission.id,
      viewValue: `permission.${permission.name}`,
    })),
  );
  roleOptions: Signal<TOption<number>[]> = computed(() =>
    this._userRoles().map((role) => ({
      value: role.id,
      viewValue: role.name,
    })),
  );
  isLoadingRoles: WritableSignal<boolean> = signal(false);

  constructor() {
    this.loadRoles();
    this.loadUserRoles();
    this.loadPermissions();
  }

  loadUserRoles(): void {
    this.roleService
      .getUserRoles()
      .pipe(take(1))
      .subscribe((roles) => {
        this._userRoles.set(roles);
      });
  }

  loadPermissions(): void {
    this.roleService
      .getPermissions()
      .pipe(
        take(1),
        finalize(() => this.isLoadingRoles.set(false)),
      )
      .subscribe((permissions) => {
        this._permissions.set(permissions);
      });
  }

  loadRoles(): void {
    this.isLoadingRoles.set(true);

    this.roleService
      .getRoles()
      .pipe(
        take(1),
        finalize(() => this.isLoadingRoles.set(false)),
      )
      .subscribe((roles) => {
        this._roles.set(roles);
      });
  }

  createRole(roleData: TRoleFormValue): Observable<TRoleDTO> {
    const request: TCreateRoleRequest = {
      name: roleData.name,
      permissions: this.mapPermissions(roleData.permissions),
    };

    return this.roleService.createRole(request);
  }

  updateRole(id: number, roleData: TRoleFormValue): Observable<TRoleDTO> {
    const request: TUpdateRoleRequest = {
      id,
      name: roleData.name,
      permissions: this.mapPermissions(roleData.permissions),
    };

    return this.roleService.updateRole(request);
  }

  deleteRole(id: number): Observable<void> {
    return this.roleService.deleteRole(id);
  }

  private mapPermissions(permissions: number[]): { id: number }[] {
    return permissions.map((id) => ({ id }));
  }
}
