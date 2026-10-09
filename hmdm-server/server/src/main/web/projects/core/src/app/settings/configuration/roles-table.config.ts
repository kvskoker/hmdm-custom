import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { RoleActionCell } from '../components/role-action-cell/role-action-cell';

@Injectable({
  providedIn: 'root',
})
export class RolesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'name',
          title: 'table.heading.role.name',
        },
        {
          field: 'actions',
          title: 'table.heading.role.actions',
          width: '120px',
          cellRenderer: RoleActionCell,
          stickyEnd: true,
        },
      ],
    };
  }
}
