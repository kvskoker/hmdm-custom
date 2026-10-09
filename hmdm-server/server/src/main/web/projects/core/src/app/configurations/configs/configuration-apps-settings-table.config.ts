import { Injectable } from '@angular/core';
import { DatetimeCell, TTableConfig } from 'hmdm-ui-kit';
import { ConfigurationAppSettingsActionCell } from '../components/configuration-app-settings-action-cell/configuration-app-settings-action-cell';
import { TAppSettingsDTO } from '../../entity/configuration/types/app-settings-dto.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationAppsSettingsTableConfig {
  getConfig(): TTableConfig<TAppSettingsDTO> {
    return {
      trackBy: (index, item) =>
        `app-setting-${item.id}-${item.applicationId}-${item.name}-${item.value}-${item.variable}`,
      columns: [
        {
          field: 'applicationPkg',
          title: 'table.heading.application.setting.app.pkg',
        },
        {
          field: 'applicationName',
          title: 'table.heading.application.setting.app.name',
        },
        {
          field: 'name',
          title: 'table.heading.application.setting.name',
        },
        {
          field: 'value',
          title: 'table.heading.application.setting.value',
        },
        {
          field: 'comment',
          title: 'table.heading.application.setting.comment',
        },
        {
          field: 'lastUpdate',
          title: 'table.heading.application.setting.lastUpdate',
          cellRenderer: DatetimeCell,
        },
        {
          field: 'actions',
          title: '',
          cellRenderer: ConfigurationAppSettingsActionCell,
          width: '40px',
          stickyEnd: true,
        },
      ],
    };
  }
}
