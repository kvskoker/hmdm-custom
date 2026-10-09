import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { VersionsActionCell } from '../components/versions-action-cell/versions-action-cell';
import { UrlCell } from '../components/url-cell/url-cell';

@Injectable()
export class ApplicationVersionsTableConfig {
  getConfig(): TTableConfig {
    return {
      trackBy: (index: number, item: any) =>
        `${item.versionCode}-${item.version}-${item.url}-${item.urlArm64}-${item.urlArmeabi}`,
      columns: [
        {
          field: 'version',
          title: 'table.heading.application.version',
        },
        {
          field: 'versionCode',
          title: 'form.application.version.code',
        },
        {
          field: 'url',
          title: 'table.heading.application.url',
          cellRenderer: UrlCell,
        },
        {
          field: 'actions',
          title: 'table.heading.application.actions',
          cellRenderer: VersionsActionCell,
          width: '120px',
          stickyEnd: true,
        },
      ],
    };
  }
}
