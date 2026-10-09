import { Injectable } from '@angular/core';
import { BooleanCell, DatetimeCell, TTableConfig } from 'hmdm-ui-kit';
import { ConfigurationActionCell } from '../components/configuration-action-cell/configuration-action-cell';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'name',
          title: 'table.heading.configuration.name',
        },
        {
          field: 'description',
          title: 'table.heading.configuration.desc',
        },
        {
          field: 'actions',
          title: 'table.heading.configuration.actions',
          cellRenderer: ConfigurationActionCell,
          stickyEnd: true,
          width: '160px',
        },
      ],
    };
  }
}
