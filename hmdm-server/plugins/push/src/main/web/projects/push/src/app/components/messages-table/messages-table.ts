import { Component, inject, ViewChild } from '@angular/core';
import { PageEvent, Table } from 'hmdm-ui-kit';
import { MessagesTableConfig } from '../../config/messages-table.config';
import { PushFacadeService } from '../../services/push-facade.service';

@Component({
  selector: 'push-messages-table',
  templateUrl: './messages-table.html',
  styleUrl: './messages-table.scss',
  imports: [Table],
})
export class MessagesTable {
  @ViewChild('table') table!: Table<unknown>;

  private readonly messagesTableConfig = inject(MessagesTableConfig);
  private readonly pushMessagesService = inject(PushFacadeService);

  tableConfig = this.messagesTableConfig.getConfig();
  tableData = this.pushMessagesService.messages;
  totalItemsCount = this.pushMessagesService.totalItemsCount;

  onPageChange($event: PageEvent): void {
    this.pushMessagesService.updatePage($event);
  }

  resetPagination(): void {
    this.table.resetPagination();
  }
}
