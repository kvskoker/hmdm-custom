import { Injectable } from '@angular/core';
import { DatetimeCell, TTableConfig } from 'hmdm-ui-kit';
import { StatusCell } from '../components/status-cell/status-cell';

@Injectable({
  providedIn: 'root',
})
export class MessagesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'ts',
          title: 'table.heading.plugin.messaging.dateTime',
          cellRenderer: DatetimeCell,
          cellRendererParams: {
            timeFormat: 'dd/MM/yyyy, HH:mm:ss',
          },
        },
        {
          field: 'deviceNumber',
          title: 'table.heading.plugin.messaging.deviceNumber',
        },
        {
          field: 'status',
          title: 'table.heading.plugin.messaging.status',
          cellRenderer: StatusCell,
        },
        {
          field: 'message',
          title: 'table.heading.plugin.messaging.message',
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
    };
  }
}
