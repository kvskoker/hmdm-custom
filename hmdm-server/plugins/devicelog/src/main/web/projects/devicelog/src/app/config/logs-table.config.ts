import { Injectable } from '@angular/core';
import { DatetimeCell, TTableConfig } from 'hmdm-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class LogsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'createTime',
          title: 'table.heading.plugin.devicelog.dateTime',
          cellRenderer: DatetimeCell,
          cellRendererParams: {
            timeFormat: 'dd/MM/yyyy, HH:mm:ss',
          },
        },
        {
          field: 'deviceNumber',
          title: 'table.heading.plugin.devicelog.deviceNumber',
        },
        {
          field: 'applicationPkg',
          title: 'table.heading.plugin.devicelog.app',
        },
        {
          field: 'severity',
          title: 'table.heading.plugin.devicelog.severity',
        },
        {
          field: 'message',
          title: 'table.heading.plugin.devicelog.message',
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
      trackBy: 'id',
    };
  }
}
