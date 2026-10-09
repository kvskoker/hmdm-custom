import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfigurationCopyDialog } from '../components/configuration-copy-dialog/configuration-copy-dialog';
import { TConfigurationDTO } from '../../entity/configuration/types/configuration-dto.type';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, take } from 'rxjs';
import { TConfigurationCopyFormValue } from '../types/configuration-copy-form.type';
import { ConfigurationsFacadeService } from './configurations-facade.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);
  private readonly configurationService = inject(ConfigurationsFacadeService);

  openCreateDialog(): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'configuration.add.warning',
          title: '',
          cancelButtonText: 'button.cancel',
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.router.navigate(['home', 'configurations', 'details']);
      });
  }

  openDeleteDialog(config: TConfigurationDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.configuration',
          params: { configurationName: config.name },
          title: '',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((value: TConfigurationCopyFormValue) => {
        if (config.id) {
          this.configurationService.deleteConfiguration(config.id);
        }
      });
  }

  openCopyDialog(config: TConfigurationDTO): void {
    this.dialog
      .open(ConfigurationCopyDialog, {
        data: config,
        autoFocus: false,
        width: '400px',
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((value: TConfigurationCopyFormValue) => {
        if (config.id) {
          this.configurationService.copyConfiguration(config.id, value);
        }
      });
  }
}
