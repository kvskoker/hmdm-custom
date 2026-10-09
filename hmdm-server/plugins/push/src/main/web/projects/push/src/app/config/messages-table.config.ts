import { Injectable } from '@angular/core';
import { DatetimeCell, TTableConfig } from 'hmdm-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class MessagesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'ts',
          title: 'table.heading.plugin.push.dateTime',
          cellRenderer: DatetimeCell,
          cellRendererParams: {
            timeFormat: 'dd/MM/yyyy, HH:mm:ss',
          },
        },
        {
          field: 'deviceNumber',
          title: 'table.heading.plugin.push.deviceNumber',
        },
        {
          field: 'messageType',
          title: 'table.heading.plugin.push.messageType',
        },
        {
          field: 'payload',
          title: 'table.heading.plugin.push.payload',
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
    };
  }
}
