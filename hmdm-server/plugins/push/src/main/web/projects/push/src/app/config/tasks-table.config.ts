import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { TaskActionsCell } from '../components/task-actions-cell/task-actions-cell';

@Injectable({
  providedIn: 'root',
})
export class TasksTableConfig {
  getConfig(): TTableConfig {
    return {
      columns: [
        {
          field: 'messageType',
          title: 'table.heading.plugin.push.messageType',
        },
        {
          field: 'payload',
          title: 'table.heading.plugin.push.payload',
        },
        {
          field: 'comment',
          title: 'table.heading.plugin.push.comment',
        },
        {
          field: 'scope',
          title: 'table.heading.plugin.push.scope',
        },
        {
          field: 'target',
          title: 'table.heading.plugin.push.target',
        },
        {
          field: 'min',
          title: 'table.heading.plugin.push.min',
        },
        {
          field: 'hour',
          title: 'table.heading.plugin.push.hour',
        },
        {
          field: 'day',
          title: 'table.heading.plugin.push.day',
        },
        {
          field: 'weekday',
          title: 'table.heading.plugin.push.weekday',
        },
        {
          field: 'month',
          title: 'table.heading.plugin.push.month',
        },
        {
          title: 'table.heading.device.actions',
          cellRenderer: TaskActionsCell,
          stickyEnd: true,
        },
      ],
      paginator: {
        pageSizeOptions: [10, 20, 50],
        pageSize: 50,
      },
    };
  }
}
