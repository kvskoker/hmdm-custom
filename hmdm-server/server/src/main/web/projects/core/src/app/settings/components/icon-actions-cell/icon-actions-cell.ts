import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { IconDialogService } from '../../services/icon-dialog.service';
import { TIconDto } from '../../../entity/icon/types/icon-dto.type';

@Component({
  selector: 'core-icon-actions-cell',
  templateUrl: './icon-actions-cell.html',
  styleUrl: './icon-actions-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class IconActionsCell extends BaseCellRenderer<TIconDto> {
  private readonly iconDialogService = inject(IconDialogService);

  onDeleteClick() {
    this.iconDialogService.openDeleteIconDialog(this.params().data);
  }

  onEditClick() {
    this.iconDialogService.openIconEditDialog(this.params().data);
  }
}
