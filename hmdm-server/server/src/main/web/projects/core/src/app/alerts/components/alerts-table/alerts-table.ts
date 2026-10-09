import {Component, inject, output, OutputEmitterRef} from '@angular/core';
import {AlertsTableConfig} from '../../configuration/alerts-table.config';
import {AlertsConfigFacadeService} from '../../services/alerts-config-facade.service';
import {Table} from 'hmdm-ui-kit';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'core-alerts-table',
  imports: [
    Table
  ],
  templateUrl: './alerts-table.html',
  styleUrl: './alerts-table.scss',
})
export class AlertsTable {
  private alertsTableConfig = inject(AlertsTableConfig);
  private alertsFacadeService = inject(AlertsConfigFacadeService);

  pageChange: OutputEmitterRef<PageEvent> = output();

  tableConfig = this.alertsTableConfig.getConfig();
  tableData = this.alertsFacadeService.alerts;
  totalItems = this.alertsFacadeService.totalAlerts;
}
