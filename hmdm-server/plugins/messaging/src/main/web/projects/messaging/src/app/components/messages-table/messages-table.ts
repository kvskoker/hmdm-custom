import { Component, inject, ViewChild } from '@angular/core';
import { PageEvent, Table } from 'hmdm-ui-kit';
import { MessagesTableConfig } from '../../config/messages-table.config';
import { MessagesFacadeService } from '../../services/messages-facade.service';

@Component({
  selector: 'messaging-messages-table',
  templateUrl: './messages-table.html',
  styleUrl: './messages-table.scss',
  imports: [Table],
})
export class MessagesTable {
  @ViewChild('table') table!: Table<unknown>;

  private readonly messagesTableConfig = inject(MessagesTableConfig);
  private readonly messagesFacadeService = inject(MessagesFacadeService);

  tableConfig = this.messagesTableConfig.getConfig();
  tableData = this.messagesFacadeService.messages;
  totalItemsCount = this.messagesFacadeService.totalItemsCount;

  onPageChange($event: PageEvent): void {
    this.messagesFacadeService.updatePage($event);
  }

  resetPagination(): void {
    this.table.resetPagination();
  }
}
