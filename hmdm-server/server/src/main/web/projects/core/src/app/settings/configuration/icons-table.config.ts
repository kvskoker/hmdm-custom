import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { IconActionsCell } from '../components/icon-actions-cell/icon-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class IconsTableConfig {
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
          cellRenderer: IconActionsCell,
          stickyEnd: true,
        },
      ],
    };
  }
}
