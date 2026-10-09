import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { ConfigurationFileDialogService } from '../../services/configuration-files-dialog.service';
import { TConfigurationFileDTO } from '../../../entity/configuration/types/configuration-file-dto.type';

@Component({
  selector: 'core-configuration-file-action-cell',
  templateUrl: './configuration-file-action-cell.html',
  styleUrl: './configuration-file-action-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class ConfigurationFileActionCell extends BaseCellRenderer<TConfigurationFileDTO> {
  private readonly dialogService = inject(ConfigurationFileDialogService);

  onEditClick(): void {
    const data = this.params().data;
    this.dialogService.openEditDialog(data);
  }

  onDeleteClick(): void {
    const data = this.params().data;
    this.dialogService.openDeleteDialog(data);
  }
}
