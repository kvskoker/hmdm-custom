import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { RoleActionCell } from '../components/role-action-cell/role-action-cell';
import { UserActionCell } from '../components/user-action-cell/user-action-cell';

@Injectable({
  providedIn: 'root',
})
export class UsersTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'login',
          title: 'table.heading.users.login',
        },
        {
          field: 'name',
          title: 'table.heading.users.name',
        },
        {
          field: 'userRole.name',
          title: 'table.heading.users.role',
        },
        {
          field: 'actions',
          title: 'table.heading.users.actions',
          cellRenderer: UserActionCell,
          width: '160px',
          stickyEnd: true,
        },
      ],
    };
  }
}
