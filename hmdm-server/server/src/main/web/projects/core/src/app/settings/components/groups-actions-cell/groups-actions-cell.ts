import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TGroupDTO } from '../../../entity/group/types/group-dto.type';
import { GroupsDialogService } from '../../services/groups-dialog.service';

@Component({
  selector: 'core-groups-actions-cell',
  templateUrl: './groups-actions-cell.html',
  styleUrl: './groups-actions-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class GroupsActionsCell extends BaseCellRenderer<TGroupDTO> {
  private readonly groupsDialogService = inject(GroupsDialogService);

  onEditClick(): void {
    this.groupsDialogService.openEditGroup(this.params().data);
  }

  onDeleteClick(): void {
    this.groupsDialogService.openDeleteGroup(this.params().data);
  }
}
