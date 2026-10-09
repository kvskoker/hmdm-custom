import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TUserDTO } from '../../../entity/user/types/user-dto.type';
import { UsersDialogService } from '../../services/users-dialog.service';

@Component({
  selector: 'core-user-action-cell',
  templateUrl: './user-action-cell.html',
  styleUrl: './user-action-cell.scss',
  imports: [MatIconModule, MatButtonModule],
})
export class UserActionCell extends BaseCellRenderer<TUserDTO> {
  private readonly userDialogService = inject(UsersDialogService);

  onDeleteClick(): void {
    this.userDialogService.openDeleteUser(this.params().data);
  }

  onImpersonateClick(): void {
    this.userDialogService.openImpersonateUser(this.params().data);
  }

  onEditClick(): void {
    this.userDialogService.openEditUser(this.params().data);
  }

  isEditable(): boolean {
    const user = this.params().data;
    return user.editable && !user.superAdmin;
  }
}
