import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, take, switchMap } from 'rxjs';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TVersionDTO } from '../../entity/application/types/version-dto.type';
import { ApplicationConfigDialog } from '../components/application-config-dialog/application-config-dialog';
import { EditVersionDialog } from '../components/edit-version-dialog/edit-version-dialog';
import { VersionDialog } from '../components/version-dialog/version-dialog';
import { VersionFacadeService } from './version-facade.service';

@Injectable()
export class VersionDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly versionService = inject(ApplicationService);
  private readonly versionFacadeService = inject(VersionFacadeService);

  openAddVersionDialog(applicationId: number): void {
    this.dialog
      .open(VersionDialog, {
        data: { applicationId },
        width: '500px',
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.versionFacadeService.initLast();
      });
  }

  openEditVersionDialog(version: TVersionDTO): void {
    this.dialog
      .open(EditVersionDialog, {
        data: { version },
        width: '500px',
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.versionService.updateApplicationVersion(data)),
      )
      .subscribe(() => {
        this.versionFacadeService.initLast();
      });
  }

  openDeleteVersionDialog(version: TVersionDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.application.version',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            applicationVersion: version.version,
          },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.versionService.deleteApplicationVersion(version.id)),
      )
      .subscribe(() => {
        this.versionFacadeService.initLast();
      });
  }

  openConfigurationDialog(versionId: number): void {
    this.dialog
      .open(ApplicationConfigDialog, { data: { versionId } })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.versionFacadeService.initLast();
      });
  }
}
