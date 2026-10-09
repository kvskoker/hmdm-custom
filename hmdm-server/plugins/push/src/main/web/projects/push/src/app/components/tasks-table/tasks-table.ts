import { Component, inject, ViewChild } from '@angular/core';
import { PageEvent, Table } from 'hmdm-ui-kit';
import { TasksTableConfig } from '../../config/tasks-table.config';
import { TasksFacadeService } from '../../services/tasks-facade.service';

@Component({
  selector: 'push-tasks-table',
  templateUrl: './tasks-table.html',
  styleUrl: './tasks-table.scss',
  imports: [Table],
})
export class TasksTable {
  @ViewChild('table') table!: Table<unknown>;

  private readonly tasksTableConfig = inject(TasksTableConfig);
  private readonly tasksFacadeService = inject(TasksFacadeService);

  tableConfig = this.tasksTableConfig.getConfig();
  tableData = this.tasksFacadeService.tasks;
  totalItemsCount = this.tasksFacadeService.totalItemsCount;

  onPageChange($event: PageEvent): void {
    this.tasksFacadeService.updatePage($event);
  }

  resetPagination(): void {
    this.table.resetPagination();
  }
}
