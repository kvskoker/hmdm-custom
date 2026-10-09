import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TAppSettingsDTO } from '../../../entity/configuration/types/app-settings-dto.type';
import { ConfigurationAppSettingsDialogService } from '../../services/configuration-app-settings-dialog.service';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';

@Component({
  selector: 'core-configuration-app-settings-action-cell',
  templateUrl: './configuration-app-settings-action-cell.html',
  styleUrl: './configuration-app-settings-action-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class ConfigurationAppSettingsActionCell extends BaseCellRenderer<TAppSettingsDTO> {
  private readonly configurationAppSettingsDialogService: ConfigurationAppSettingsDialogService =
    inject(ConfigurationAppSettingsDialogService);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);

  onDeleteClick(): void {
    const id = this.params().data.id;

    id && this.configurationDetailsFacadeService.deleteAppSetting(id);
  }

  onEditClick(): void {
    this.configurationAppSettingsDialogService.openEditDialog(this.params().data);
  }
}
