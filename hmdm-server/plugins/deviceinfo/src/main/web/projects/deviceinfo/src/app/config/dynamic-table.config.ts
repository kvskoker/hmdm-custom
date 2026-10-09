import { Injectable } from '@angular/core';
import { DatetimeCell, TTableConfig } from 'hmdm-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class DynamicTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'latestUpdateTime',
          title: 'plugin.deviceinfo.title.time',
          cellRenderer: DatetimeCell,
          cellRendererParams: {
            timeFormat: 'dd.MM.yyyy HH:mm:ss',
          },
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
    };
  }
}
