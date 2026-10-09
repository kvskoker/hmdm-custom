import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { RolesTableConfig } from '../../configuration/roles-table.config';
import { RoleFacadeService } from '../../services/role-facade.service';

@Component({
  selector: 'core-roles-table',
  templateUrl: './roles-table.html',
  styleUrl: './roles-table.scss',
  imports: [Table],
})
export class RolesTable {
  private readonly rolesTableConfig: RolesTableConfig = inject(RolesTableConfig);
  private readonly rolesFacadeService: RoleFacadeService = inject(RoleFacadeService);

  tableConfig = this.rolesTableConfig.getConfig();
  data = this.rolesFacadeService.roles;
}
