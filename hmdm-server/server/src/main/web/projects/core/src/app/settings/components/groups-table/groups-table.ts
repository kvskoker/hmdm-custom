import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { GroupsTableConfig } from '../../configuration/groups-table.config';
import { GroupFacadeService } from '../../services/group-facade.service';

@Component({
  selector: 'core-groups-table',
  templateUrl: './groups-table.html',
  styleUrl: './groups-table.scss',
  imports: [Table],
})
export class GroupsTable {
  private readonly groupsTableConfig = inject(GroupsTableConfig);
  private readonly groupFacadeService = inject(GroupFacadeService);

  tableConfig = this.groupsTableConfig.getConfig();
  tableData = this.groupFacadeService.groups;
}
