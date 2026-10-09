import { Injectable } from '@angular/core';
import { DatetimeCell, TranslateCell, TTableConfig } from 'hmdm-ui-kit';
import { AuditDetailsCell } from '../components/audit-details-cell/audit-details-cell';

@Injectable()
export class AuditTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          title: 'table.heading.plugin.audit.dateTime',
          field: 'createTime',
          cellRenderer: DatetimeCell,
          cellRendererParams: {
            dateFormat: 'short',
          },
        },
        {
          title: 'table.heading.plugin.audit.user',
          field: 'login',
        },
        {
          title: 'table.heading.plugin.audit.ipAddress',
          field: 'ipAddress',
        },
        {
          title: 'table.heading.plugin.audit.action',
          field: 'action',
          cellRenderer: TranslateCell,
        },
        {
          title: 'plugin.audit.button.details',
          field: 'details',
          cellRenderer: AuditDetailsCell,
        },
      ],
      paginator: {
        hidePageSize: true,
        pageSize: 50,
      },
    };
  }
}
