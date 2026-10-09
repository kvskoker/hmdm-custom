import { Injectable } from '@angular/core';
import { BooleanCell, DatetimeCell, TTableConfig } from 'hmdm-ui-kit';
import { FilesActionCell } from '../components/files-action-cell/files-action-cell';
import { SizeCell } from '../components/size-cell/size-cell';

@Injectable({
  providedIn: 'root',
})
export class FilesTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'filePath',
          title: 'table.heading.file.name',
        },
        {
          field: 'description',
          title: 'table.heading.file.comment',
        },
        {
          field: 'size',
          title: 'table.heading.file.size',
          cellRenderer: SizeCell,
        },
        {
          field: 'uploadTime',
          title: 'table.heading.file.update.time',
          cellRenderer: DatetimeCell,
        },
        {
          field: 'external',
          title: 'table.heading.file.external',
          cellRenderer: BooleanCell,
        },
        {
          field: 'replaceVariables',
          title: 'table.heading.file.variable',
          cellRenderer: BooleanCell,
        },
        {
          field: 'actions',
          title: 'table.heading.file.actions',
          cellRenderer: FilesActionCell,
          stickyEnd: true,
          width: '220px',
        },
      ],
    };
  }
}
