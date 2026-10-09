import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { RolesDialogService } from '../../services/roles-dialog.service';

@Component({
  selector: 'core-role-action-cell',
  templateUrl: './role-action-cell.html',
  styleUrl: './role-action-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class RoleActionCell extends BaseCellRenderer {
  private readonly roleDialogService = inject(RolesDialogService);

  onDeleteClick() {
    this.roleDialogService.openDeleteRole(this.params().data);
  }

  onEditClick() {
    this.roleDialogService.openEditRole(this.params().data);
  }
}
