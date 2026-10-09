import { Component, inject, ViewChild } from '@angular/core';
import { PageEvent, Table } from 'hmdm-ui-kit';
import { LogsTableConfig } from '../../config/logs-table.config';
import { LogsFacadeService } from '../../services/logs-facade.service';

@Component({
  selector: 'logs-table',
  templateUrl: './logs-table.html',
  styleUrl: './logs-table.scss',
  imports: [Table],
})
export class LogsTable {
  @ViewChild('table') table!: Table<unknown>;

  private readonly logsTableConfig = inject(LogsTableConfig);
  private readonly logsFacadeService = inject(LogsFacadeService);

  tableConfig = this.logsTableConfig.getConfig();
  tableData = this.logsFacadeService.logs;
  totalItemsCount = this.logsFacadeService.totalItemsCount;

  onPageChange($event: PageEvent): void {
    this.logsFacadeService.updatePage($event);
  }

  resetPagination(): void {
    this.table.resetPagination();
  }
}
