import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog, InformDialog } from 'hmdm-ui-kit';
import {
  catchError,
  filter,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { EApplicationType } from '../../entity/application/enum/application-type.enum';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { TApplicationFormEmitValue } from '../types/application-form.type';
import { ApplicationConfigDialog } from '../components/application-config-dialog/application-config-dialog';
import { ApplicationDialog } from '../components/application-dialog/application-dialog';
import {
  DuplicatePkgDialog,
  TDuplicatePkgDialogResult,
} from '../components/duplicate-pkg-dialog/duplicate-pkg-dialog';
import { TVersionDTO } from '../../entity/application/types/version-dto.type';
import { ApplicationFacadeService } from './application-facade.service';

type TSaveResult =
  | { outcome: 'saved'; entity: TApplicationDTO | TVersionDTO | null }
  | { outcome: 'name-taken' }
  | { outcome: 'cancelled' };

const saved = (entity: TApplicationDTO | TVersionDTO | null): TSaveResult => ({
  outcome: 'saved',
  entity,
});

@Injectable({ providedIn: 'root' })
export class ApplicationDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly applicationService = inject(ApplicationService);
  private readonly applicationFacadeService = inject(ApplicationFacadeService);
  private readonly snackBarService = inject(SnackBarService);

  openAddApplicationDialog(): void {
    const dialogRef = this.dialog.open(ApplicationDialog, { minWidth: '600px' });
    const instance = dialogRef.componentInstance;

    instance.saveTrigger$
      .pipe(
        takeUntil(dialogRef.beforeClosed()),
        switchMap((data) => {
          instance.isSaving.set(true);
          return this.resolveAndSave(data, true).pipe(
            catchError(() => of<TSaveResult>({ outcome: 'cancelled' })),
            finalize(() => instance.isSaving.set(false)),
          );
        }),
      )
      .subscribe((result) => {
        if (result.outcome === 'name-taken') {
          instance.nameError.set('error.app.name.exists');
          return;
        }

        if (result.outcome !== 'saved' || !result.entity) return;

        const res = result.entity;

        dialogRef.close();
        this.applicationFacadeService.searchApplications();

        if (!this.applicationFacadeService.formData?.showSystem && res.system) {
          this.openSystemAppMessageDialog();
        }

        const applicationId = 'applicationId' in res ? res.applicationId : res.id;
        const versionId = 'applicationId' in res ? res.id : res.usedVersionId;
        this.openSelectConfigurationDialog(applicationId, versionId);
      });
  }

  openEditApplicationDialog(application: TApplicationDTO): void {
    const dialogRef = this.dialog.open(ApplicationDialog, { minWidth: '600px', data: application });
    const instance = dialogRef.componentInstance;

    instance.saveTrigger$
      .pipe(
        takeUntil(dialogRef.beforeClosed()),
        switchMap((data) => {
          instance.isSaving.set(true);
          // The id decides insert vs update on the backend, so pin it here
          // rather than relying on the form to carry it through.
          return this.resolveAndSave({ ...data, id: application.id }, false).pipe(
            catchError(() => of<TSaveResult>({ outcome: 'cancelled' })),
            finalize(() => instance.isSaving.set(false)),
          );
        }),
      )
      .subscribe((result) => {
        if (result.outcome !== 'saved') return;

        dialogRef.close();
        this.applicationFacadeService.searchApplications();
      });
  }

  private resolveAndSave(
    data: TApplicationFormEmitValue,
    isNewApp: boolean,
  ): Observable<TSaveResult> {
    if (data.type !== EApplicationType.APP || !data.filePath) {
      return this.applicationService.createApplication(data).pipe(map(saved));
    }

    const appData = data;
    const validateBody = {
      arch: appData.arch || null,
      type: appData.type,
      pkg: appData.pkg,
      name: appData.name,
      version: appData.version,
      versionCode: appData.versionCode ?? 0,
      filePath: appData.filePath,
      runAtBoot: appData.runAtBoot,
      runAfterInstall: appData.runAfterInstall,
      showIcon: appData.showIcon,
      system: appData.system,
      autoUpdateDisplayed: true,
    };

    return this.applicationService.validatePkg(validateBody).pipe(
      switchMap((duplicates) => {
        if (!duplicates?.length) {
          return this.applicationService.createApplication(data).pipe(map(saved));
        }

        // Single match and version is new → silently add a new version
        if (duplicates.length === 1 && !appData.versionExists) {
          return this.applicationService
            .createApplicationVersion({
              applicationId: duplicates[0].id,
              version: appData.version,
              arch: appData.arch || null,
              filePath: appData.filePath,
              versionCode: appData.versionCode,
              pkg: appData.pkg,
              name: appData.name,
              type: appData.type,
              runAtBoot: appData.runAtBoot,
              runAfterInstall: appData.runAfterInstall,
              showIcon: appData.showIcon,
              system: appData.system,
              autoUpdateDisplayed: true,
            })
            .pipe(map(saved));
        }

        return this.dialog
          .open(DuplicatePkgDialog, {
            minWidth: '480px',
            data: {
              duplicateApps: duplicates,
              pkg: appData.pkg,
              appName: appData.name,
              isNewApp,
            },
          })
          .afterClosed()
          .pipe(
            switchMap((result: TDuplicatePkgDialogResult | null): Observable<TSaveResult> => {
              if (!result) return of({ outcome: 'cancelled' });

              if (result.action === 'name-taken') {
                return of({ outcome: 'name-taken' });
              }

              if (result.action === 'new-version') {
                return this.applicationService
                  .createApplicationVersion({
                    applicationId: result.applicationId,
                    version: appData.version,
                    arch: appData.arch || null,
                    filePath: appData.filePath,
                    versionCode: appData.versionCode,
                    pkg: appData.pkg,
                    name: appData.name,
                    type: appData.type,
                    runAtBoot: appData.runAtBoot,
                    runAfterInstall: appData.runAfterInstall,
                    showIcon: appData.showIcon,
                    system: appData.system,
                    autoUpdateDisplayed: true,
                  })
                  .pipe(map(saved));
              }

              // 'new-app' or 'change-pkg' — proceed with normal application creation
              return this.applicationService.createApplication(data).pipe(map(saved));
            }),
          );
      }),
    );
  }

  openSelectConfigurationDialog(applicationId: number, versionId?: number): void {
    this.dialog
      .open(ApplicationConfigDialog, { data: { applicationId, versionId } })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.applicationFacadeService.searchApplications();
      });
  }

  openDeleteApplicationDialog(application: TApplicationDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.application',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            applicationName: application.name,
          },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.applicationService.deleteApplication(application.id)),
      )
      .subscribe(() => {
        this.applicationFacadeService.searchApplications();
      });
  }

  openSharedApplicationDialog(): void {
    this.dialog.open(InformDialog, {
      data: {
        message: 'alerts.application.shared',
      },
    });
  }

  openSystemAppMessageDialog(): void {
    this.dialog.open(InformDialog, {
      data: {
        message: 'alerts.system.apps.filter',
      },
    });
  }
}
