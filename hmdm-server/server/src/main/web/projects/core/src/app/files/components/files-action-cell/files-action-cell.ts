import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { TFileDTO } from '../../../entity/file/types/file-dto.type';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { FilesDialogService } from '../../services/files-dialog.service';

@Component({
  selector: 'core-files-action-cell',
  templateUrl: './files-action-cell.html',
  styleUrl: './files-action-cell.scss',
  imports: [MatIconModule, MatButtonModule, MatTooltip, HasPermissionDirective],
})
export class FilesActionCell extends BaseCellRenderer<TFileDTO> implements OnInit {
  private filesDialogService = inject(FilesDialogService);

  copyTooltip: WritableSignal<string> = signal('');

  ngOnInit(): void {
    this.copyTooltip.set(this.params().data.url);
  }

  onDeleteClick(): void {
    const file = this.params().data;

    if (!file) {
      return;
    }

    this.filesDialogService.openDeleteFileDialog(file);
  }

  onEditClick(): void {
    const file = this.params().data;

    this.filesDialogService.openEditFileDialog(file);
  }

  onCopyClick(): void {
    const file = this.params().data;

    if (!file?.url) {
      return;
    }

    navigator.clipboard.writeText(file.url);
  }

  onConfigClick(): void {
    const file = this.params().data;

    if (!file) {
      return;
    }

    this.filesDialogService.openConfigFileDialog(file);
  }

  isEditDisabled(): boolean {
    const file = this.params().data;
    return !file || file.size === -1;
  }

  isDeleteDisabled(): boolean {
    const file = this.params().data;
    return (
      !file ||
      file.usedByApps ||
      file.usedByConfigurations.length > 0 ||
      file.usedByIcons.length > 0
    );
  }
}
