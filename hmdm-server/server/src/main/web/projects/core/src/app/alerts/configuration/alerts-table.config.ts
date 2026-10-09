import {Injectable} from '@angular/core';
import {DatetimeCell, TTableConfig} from 'hmdm-ui-kit';
import {SeverityCell} from '../components/severity-cell/severity-cell';

@Injectable({
  providedIn: 'root',
})
export class AlertsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'createTime',
          title: 'alerts.table.date.and.time',
          cellRenderer: DatetimeCell,
        },
        {
          field: 'deviceNumber',
          title: 'form.qr.device.number'
        },
        {
          field: 'level',
          title: 'table.heading.alerts.level',
          cellRenderer: SeverityCell,
        },
        {
          field: 'message',
          title: 'table.heading.alerts.message'
        }
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 10
      }
    };
  }
}
