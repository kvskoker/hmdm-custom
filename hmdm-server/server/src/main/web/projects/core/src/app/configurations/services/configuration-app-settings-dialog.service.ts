import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { TAppSettingsDTO } from '../../entity/configuration/types/app-settings-dto.type';
import { ConfigurationAppSettingsDialog } from '../components/configuration-app-settings-dialog/configuration-app-settings-dialog';
import { filter, take } from 'rxjs';
import { ConfigurationDetailsFacadeService } from './configuration-details-facade.service';
import { ConfigurationAppsFacadeService } from './configuration-applications-facade.service';
import { TConfigurationAppSettingsFormValue } from '../types/configuration-app-settings-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationAppSettingsDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly configurationDetailsFacadeSerivice = inject(ConfigurationDetailsFacadeService);
  private readonly configurationApplicationsFacadeService = inject(ConfigurationAppsFacadeService);

  openAddDialog(): void {
    this.dialog
      .open(ConfigurationAppSettingsDialog, {
        width: '600px',
        autoFocus: false,
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((val: TConfigurationAppSettingsFormValue) => {
        const application = this.configurationApplicationsFacadeService.getApplicationById(
          val.applicationId!,
        );

        if (!application || !val.applicationId) {
          return;
        }

        const appSetting: TAppSettingsDTO = {
          ...val,
          applicationId: val.applicationId,
          applicationName: application ? application.name : '',
          applicationPkg: application ? application.pkg : '',
          lastUpdate: new Date().getTime(),
          type: 'STRING',
        };

        this.configurationDetailsFacadeSerivice.addAppSetting(appSetting);
      });
  }

  openEditDialog(setting: TAppSettingsDTO): void {
    this.dialog
      .open(ConfigurationAppSettingsDialog, {
        width: '600px',
        data: setting,
        autoFocus: false,
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((val: TConfigurationAppSettingsFormValue) => {
        if (!val.applicationId) {
          return;
        }

        this.configurationDetailsFacadeSerivice.updateAppSetting(setting, {
          ...setting,
          ...val,
          applicationId: val.applicationId ?? setting.applicationId,
        });
      });
  }

  openDeleteDialog(setting: TAppSettingsDTO): void {
    this.dialog.open(ConfirmDialog, {
      data: setting,
    });
  }
}
