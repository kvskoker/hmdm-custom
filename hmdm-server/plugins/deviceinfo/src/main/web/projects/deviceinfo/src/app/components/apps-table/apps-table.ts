import { Component, inject } from '@angular/core';
import { AppsTableConfig } from '../../config/apps-table.config';
import { DetailsFacadeService } from '../../services/details-facade.service';
import { Table } from 'hmdm-ui-kit';

@Component({
  selector: 'di-apps-table',
  templateUrl: './apps-table.html',
  styleUrl: './apps-table.scss',
  imports: [Table],
})
export class AppsTable {
  private readonly appsTableConfig = inject(AppsTableConfig);
  private readonly detailsFacadeService = inject(DetailsFacadeService);

  tableConfig = this.appsTableConfig.getConfig();
  tableData = this.detailsFacadeService.details;
}
