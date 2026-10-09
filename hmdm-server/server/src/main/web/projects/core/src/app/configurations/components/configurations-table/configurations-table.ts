import { Component, inject, OnInit } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { ConfigurationsTableConfig } from '../../configs/configurations-table.config';
import { ConfigurationsFacadeService } from '../../services/configurations-facade.service';

@Component({
  selector: 'core-configurations-table',
  templateUrl: './configurations-table.html',
  styleUrl: './configurations-table.scss',
  imports: [Table],
})
export class ConfigurationsTable implements OnInit {
  private readonly configurationsTableConfig: ConfigurationsTableConfig =
    inject(ConfigurationsTableConfig);
  private readonly configurationsFacadeService = inject(ConfigurationsFacadeService);

  tableConfig = this.configurationsTableConfig.getConfig();
  configurations = this.configurationsFacadeService.tableData;

  ngOnInit(): void {
    this.configurationsFacadeService.searchConfigurations();
  }
}
