import { Component, inject, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoaderDirective, TranslatePipe } from 'hmdm-ui-kit';
import { RolesTable } from '../../components/roles-table/roles-table';
import { RoleFacadeService } from '../../services/role-facade.service';
import { RolesDialogService } from '../../services/roles-dialog.service';

@Component({
  selector: 'core-roles',
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LoaderDirective,
    TranslatePipe,
    MatDividerModule,
    RolesTable,
  ],
})
export class Roles {
  private readonly rolesFacadeService: RoleFacadeService = inject(RoleFacadeService);
  private readonly rolesDialogService: RolesDialogService = inject(RolesDialogService);

  isLoadingRoles: WritableSignal<boolean> = this.rolesFacadeService.isLoadingRoles;

  onAddRoleClick() {
    this.rolesDialogService.openAddRole();
  }
}
