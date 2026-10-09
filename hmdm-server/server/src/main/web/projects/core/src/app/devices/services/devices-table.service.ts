import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, take } from 'rxjs';
import { DevicesService } from '../../entity/device/services/devices.service';
import { DevicesFormDialog } from '../components/devices-form-dialog/devices-form-dialog';
import { TDevice } from '../types/device.type';
import { DevicesFacadeService } from './devices-facade.service';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { LicenseService } from '../../auth/services/license.service';

@Injectable({ providedIn: 'root' })
export class DevicesTableService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly deviceFacadeService = inject(DevicesFacadeService);
  private readonly deviceService = inject(DevicesService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly licenseService = inject(LicenseService);

  openEditDialog(device: TDevice): void {
    const id = device.id;
    if (!id) {
      console.error('Device ID is missing. Cannot open edit dialog.');
      return;
    }

    const dialogRef = this.dialog.open(DevicesFormDialog, {
      data: device,
      minWidth: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result) => {
        this.deviceFacadeService.updateDevice(result, id);
      });
  }

  openDeleteConfirmDialog(deviceId: TDevice): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.device',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            deviceNumber: deviceId.number ?? '',
          },
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() =>
        this.deviceService
          .delete(deviceId.id!)
          .pipe(take(1))
          .subscribe(() => {
            this.deviceFacadeService.searchDevices({ force: true });
            this.settingsFacadeService.fetchSettings().subscribe();
            this.licenseService.refreshLicenses();
          }),
      );
  }
}
