import { Component, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { BaseCellRenderer, MatButtonModule, MatIconModule, TranslatePipe } from 'hmdm-ui-kit';
import { TVersionDTO } from '../../../entity/application/types/version-dto.type';
import { VersionDialogService } from '../../services/version-dialog.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';

@Component({
  selector: 'core-versions-action-cell',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltip,
    TranslatePipe,
    HasPermissionDirective,
  ],
  templateUrl: './versions-action-cell.html',
  styleUrl: './versions-action-cell.scss',
})
export class VersionsActionCell extends BaseCellRenderer<TVersionDTO, null> {
  private readonly versionDialogService = inject(VersionDialogService);

  onConfigClick(): void {
    const id = this.params().data.id;

    if (!id) {
      return;
    }

    this.versionDialogService.openConfigurationDialog(id);
  }

  onDeleteClick(): void {
    const version = this.params().data;

    if (!version.id) {
      return;
    }

    this.versionDialogService.openDeleteVersionDialog(version);
  }

  isDeleteDisabled(): boolean {
    return this.params().data.deletionProhibited;
  }

  onEditClick(): void {
    console.log('Edit version clicked for version:', this.params().data);

    this.versionDialogService.openEditVersionDialog(this.params().data);
  }
}
