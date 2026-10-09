import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';

@Injectable({
  providedIn: 'root',
})
export class AppsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'applicationName',
          title: 'plugin.deviceinfo.title.apps.name',
        },
        {
          field: 'applicationPkg',
          title: 'plugin.deviceinfo.title.apps.pkg',
        },
        {
          field: 'versionInstalled',
          title: 'plugin.deviceinfo.title.apps.ver1',
        },
        {
          field: 'versionRequired',
          title: 'plugin.deviceinfo.title.apps.ver2',
        },
      ],
    };
  }
}
