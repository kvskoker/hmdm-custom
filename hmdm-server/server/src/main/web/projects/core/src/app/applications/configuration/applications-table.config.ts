import { Injectable } from '@angular/core';
import { BooleanCell, TTableConfig } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { AppNameCell } from '../components/app-name-cell/app-name-cell';
import { ApplicationActionCell } from '../components/application-action-cell/application-action-cell';
import { UrlCell } from '../components/url-cell/url-cell';

@Injectable()
export class ApplicationsTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'pkg',
          title: 'table.heading.application.pkg',
          cellRenderer: AppNameCell,
          sortable: true,
        },
        {
          field: 'name',
          title: 'table.heading.application.name',
          sortable: true,
        },
        {
          field: 'version',
          title: 'table.heading.application.version',
          sortable: true,
        },
        {
          field: 'url',
          title: 'table.heading.application.url',
          cellRenderer: UrlCell,
        },
        {
          field: 'icon',
          title: 'table.heading.application.label',
          cellRenderer: BooleanCell,
          cellRendererParams: {
            isShow: (data: TApplicationDTO) => {
              return data.showIcon;
            },
          },
        },
        {
          field: 'actions',
          title: 'table.heading.application.actions',
          width: '200px',
          stickyEnd: true,
          cellRenderer: ApplicationActionCell,
        },
      ],
    };
  }
}
