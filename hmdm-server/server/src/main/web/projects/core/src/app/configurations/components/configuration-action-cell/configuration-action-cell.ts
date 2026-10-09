import { Component, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BaseCellRenderer, MatButtonModule, MatIconModule, TranslatePipe } from 'hmdm-ui-kit';
import { TConfigurationDTO } from '../../../entity/configuration/types/configuration-dto.type';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { QrFacadeService } from '../../../shared/services/qr-facade.service';
import { ConfigurationsDialogService } from '../../services/configurations-dialog.service';

@Component({
  selector: 'core-configuration-action-cell',
  templateUrl: './configuration-action-cell.html',
  styleUrl: './configuration-action-cell.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    HasPermissionDirective,
    MatTooltipModule,
    TranslatePipe,
  ],
})
export class ConfigurationActionCell extends BaseCellRenderer<TConfigurationDTO> {
  private readonly router: Router = inject(Router);
  private readonly configurationDialogService = inject(ConfigurationsDialogService);
  private readonly qrService = inject(QrFacadeService);

  onQrCodeClick(): void {
    const data = this.params().data;
    console.log(data);

    this.qrService.openQrCodeDialog({
      qrCodeKey: data.qrCodeKey!,
      params: this.convertStringToJson(data.qrParameters || '') || undefined,
    });
  }

  onCopyClick(): void {
    this.configurationDialogService.openCopyDialog(this.params().data);
  }

  onDeleteClick(): void {
    this.configurationDialogService.openDeleteDialog(this.params().data);
  }

  onEditClick(): void {
    this.router.navigateByUrl(`home/configurations/details/${this.params().data.id}`);
  }

  isQrCodeAvailable(): boolean {
    const configuration = this.params().data;

    return (
      !!configuration.qrCodeKey &&
      configuration.mainAppId !== null &&
      configuration?.mainAppId > 0 &&
      !!configuration.eventReceivingComponent &&
      configuration.eventReceivingComponent.length > 0
    );
  }

  isDisabledDelete(): boolean {
    return this.params().data.id === 1;
  }

  private convertStringToJson(input: string): Record<string, string> | null {
    try {
      const jsonString = '{' + input.replace(/,\s*$/, '').replace(/\\n/g, '') + '}';
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse string to JSON:', error);
      return null;
    }
  }
}
