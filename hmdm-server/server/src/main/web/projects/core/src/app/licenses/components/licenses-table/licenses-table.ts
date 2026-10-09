import {Component, inject} from '@angular/core';
import {Table} from 'hmdm-ui-kit';
import {LicensesTableConfig} from '../../configuration/licenses-table.config';
import {LicensesRestService} from '../../services/licenses-rest.service';

@Component({
  selector: 'core-licenses-table',
  imports: [
    Table
  ],
  templateUrl: './licenses-table.html',
  styleUrl: './licenses-table.scss',
})
export class LicensesTable {
  private licensesTableConfig = inject(LicensesTableConfig);
  private licensesService = inject(LicensesRestService);

  tableConfig = this.licensesTableConfig.getConfig();
  tableData = this.licensesService.licensesData;
}
