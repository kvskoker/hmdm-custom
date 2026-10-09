import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { TAppSettingsDTO } from '../../../entity/configuration/types/app-settings-dto.type';
import { ConfigurationAppsSettingsTableConfig } from '../../configs/configuration-apps-settings-table.config';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';

@Component({
  selector: 'core-configuration-app-settings-table',
  templateUrl: './configuration-app-settings-table.html',
  styleUrl: './configuration-app-settings-table.scss',
  imports: [Table],
})
export class ConfigurationAppSettingsTable {
  private readonly tableConfigService = inject(ConfigurationAppsSettingsTableConfig);
  private readonly configDetailsFacadeService = inject(ConfigurationDetailsFacadeService);

  tableConfig = this.tableConfigService.getConfig();
  tableData: WritableSignal<TAppSettingsDTO[]> = signal(
    this.configDetailsFacadeService.appSettings(),
  );

  constructor() {
    effect(() => {
      const config = this.configDetailsFacadeService.currentConfiguration();
      this.tableData.set(config?.applicationSettings || []);
    });
  }
}
