import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { ConfigurationFileDialog } from '../components/configuration-file-dialog/configuration-file-dialog';
import { TConfigurationFileDTO } from '../../entity/configuration/types/configuration-file-dto.type';
import { ConfigurationDetailsFacadeService } from './configuration-details-facade.service';
import { filter, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationFileDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);

  openAddDialog(): void {
    this.dialog
      .open(ConfigurationFileDialog, {
        autoFocus: false,
        width: '500px',
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result: TConfigurationFileDTO) => {
        this.configurationDetailsFacadeService.addFile(result);
      });
  }

  openEditDialog(configFile: TConfigurationFileDTO): void {
    this.dialog
      .open(ConfigurationFileDialog, {
        autoFocus: false,
        width: '500px',
        data: { configFile },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result: TConfigurationFileDTO) => {
        this.configurationDetailsFacadeService.updateFile(result);
      });
  }

  openDeleteDialog(file: TConfigurationFileDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          file,
          message: 'form.configuration.file.remove.prompt.1',
          title: '',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.configurationDetailsFacadeService.deleteFile(file.id!);
      });
  }
}
