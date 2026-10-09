import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseCellRenderer } from 'hmdm-ui-kit';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { QrFacadeService } from '../../../shared/services/qr-facade.service';
import { DevicesTableService } from '../../services/devices-table.service';
import { TDevice } from '../../types/device.type';
import { TServerPlugin } from '../../../../main';

@Component({
  selector: 'core-actions-cell',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslatePipe,
    HasPermissionDirective,
    MatTooltip,
  ],
  templateUrl: './actions-cell.html',
  styleUrl: './actions-cell.scss',
})
export class ActionsCell extends BaseCellRenderer<TDevice, null> {
  private readonly deviceTableService = inject(DevicesTableService);
  private readonly qrFacadeService = inject(QrFacadeService);
  private readonly router = inject(Router);

  plugins =
    (window as any)['__DYNPLUGINS__'].filter((plugin: TServerPlugin) => plugin.enabledForDevice) ||
    [];

  onDeleteClick(): void {
    this.deviceTableService.openDeleteConfirmDialog(this.params().data);
  }

  onQrCodeClick(): void {
    console.log(this.params().data);
    this.qrFacadeService.openQrCodeDialog({
      qrCodeKey: this.params().data.configuration.qrCodeKey!,
      deviceId: this.params().data.number,
    });
  }

  onEditClick(): void {
    this.deviceTableService.openEditDialog(this.params().data);
  }

  onPluginClick(identifier: string) {
    this.router.navigate(['home', 'plugins', identifier], {
      queryParams: { deviceNumber: this.params().data.number },
    });
  }

  isQrCodeDisabled(): boolean {
    return !this.params().data.configuration.qrCodeKey;
  }
}
