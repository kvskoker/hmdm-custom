import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { GroupsActionsCell } from '../components/groups-actions-cell/groups-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class GroupsTableConfig {
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
          cellRenderer: GroupsActionsCell,
          stickyEnd: true,
        },
      ],
    };
  }
}
