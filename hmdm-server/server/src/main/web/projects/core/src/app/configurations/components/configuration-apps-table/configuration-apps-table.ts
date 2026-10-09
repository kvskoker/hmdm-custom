import { Component, inject } from '@angular/core';
import { Table, TTableSortState } from 'hmdm-ui-kit';
import { ConfigurationAppsTableConfig } from '../../configs/configuration-apps-table.config';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-configuration-apps-table',
  templateUrl: './configuration-apps-table.html',
  styleUrl: './configuration-apps-table.scss',
  imports: [Table],
})
export class ConfigurationAppsTable {
  private readonly configurationAppsTableConfig = inject(ConfigurationAppsTableConfig);
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  tableConfig = this.configurationAppsTableConfig.getConfig();
  data = this.configurationAppsFacadeService.tableData;

  onSortChange(state: TTableSortState | null): void {
    this.configurationAppsFacadeService.setSortState(state);
  }
}
