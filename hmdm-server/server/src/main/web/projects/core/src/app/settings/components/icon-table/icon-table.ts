import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { IconsTableConfig } from '../../configuration/icons-table.config';
import { IconFacadeService } from '../../services/icon-facade.service';

@Component({
  selector: 'core-icon-table',
  templateUrl: './icon-table.html',
  styleUrl: './icon-table.scss',
  imports: [Table],
})
export class IconTable {
  private readonly iconTableConfig = inject(IconsTableConfig);
  private readonly iconFacadeService = inject(IconFacadeService);

  tableConfig = this.iconTableConfig.getConfig();
  tableData = this.iconFacadeService.icons;
}
