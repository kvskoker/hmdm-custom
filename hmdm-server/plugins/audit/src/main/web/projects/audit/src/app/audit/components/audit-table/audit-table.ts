import { Component, inject } from '@angular/core';
import { PageEvent, Table } from 'hmdm-ui-kit';
import { AuditTableConfig } from '../../configuration/audit-table.config';
import { AuditFacadeService } from '../../services/audit-facade.service';

@Component({
  selector: 'audit-table',
  templateUrl: './audit-table.html',
  styleUrl: './audit-table.scss',
  imports: [Table],
})
export class AuditTable {
  private readonly auditTableConfig = inject(AuditTableConfig);
  private readonly auditFacadeService = inject(AuditFacadeService);

  tableConfig = this.auditTableConfig.getConfig();
  tableData = this.auditFacadeService.tableData;
  totalItems = this.auditFacadeService.totalItems;

  onPageChange($event: PageEvent): void {
    this.auditFacadeService.updatePage($event);
  }
}
