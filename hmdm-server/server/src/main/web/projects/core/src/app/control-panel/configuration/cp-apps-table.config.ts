import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { CpAppActionsCell } from '../components/cp-app-actions-cell/cp-app-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class CpAppsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'customerName',
          title: 'table.heading.common.apps.customer',
        },
        {
          field: 'pkg',
          title: 'table.heading.common.apps.pkg',
        },
        {
          field: 'name',
          title: 'table.heading.common.apps.name',
        },
        {
          field: 'version',
          title: 'table.heading.common.apps.version',
        },
        {
          field: 'url',
          title: 'table.heading.common.apps.url',
        },
        {
          title: 'table.heading.common.apps.actions',
          stickyEnd: true,
          width: '120px',
          cellRenderer: CpAppActionsCell,
        },
      ],
      selector: false,
      trackBy: 'id',
    };
  }
}
