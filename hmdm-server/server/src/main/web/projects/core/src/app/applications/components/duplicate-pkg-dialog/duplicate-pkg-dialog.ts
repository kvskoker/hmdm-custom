import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogBase, DialogTemplate, MAT_DIALOG_DATA, MatIconModule, Selector } from 'hmdm-ui-kit';
import { take } from 'rxjs';
import { ApplicationService } from '../../../entity/application/services/application.service';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';

export type TDuplicatePkgDialogData = {
  duplicateApps: TApplicationDTO[];
  pkg: string;
  appName: string;
  isNewApp: boolean;
};

export type TDuplicatePkgDialogResult =
  | { action: 'new-app' }
  | { action: 'new-version'; applicationId: number }
  | { action: 'change-pkg' }
  | { action: 'name-taken' };

@Component({
  selector: 'core-duplicate-pkg-dialog',
  templateUrl: './duplicate-pkg-dialog.html',
  styleUrl: './duplicate-pkg-dialog.scss',
  imports: [
    DialogTemplate,
    MatButtonModule,
    TranslatePipe,
    ReactiveFormsModule,
    Selector,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class DuplicatePkgDialog extends DialogBase {
  readonly data: TDuplicatePkgDialogData = inject(MAT_DIALOG_DATA);
  private readonly applicationService = inject(ApplicationService);

  targetAppControl = new FormControl<number | null>(this.data.duplicateApps[0]?.id ?? null);

  isChecking = signal(false);

  get appOptions() {
    return this.data.duplicateApps.map((app) => ({ value: app.id, viewValue: app.name }));
  }

  override onSave(): void {}

  onNewVersion(): void {
    const appId = this.targetAppControl.value;
    if (!appId) return;
    this.dialogRef.close({
      action: 'new-version',
      applicationId: appId,
    } satisfies TDuplicatePkgDialogResult);
  }

  onNewApp(): void {
    this.isChecking.set(true);

    this.applicationService
      .checkNameExists(this.data.appName)
      .pipe(take(1))
      .subscribe({
        next: (exists) => {
          this.isChecking.set(false);
          if (exists) {
            this.dialogRef.close({ action: 'name-taken' } satisfies TDuplicatePkgDialogResult);
          } else {
            this.dialogRef.close({ action: 'new-app' } satisfies TDuplicatePkgDialogResult);
          }
        },
        error: () => {
          this.isChecking.set(false);
          this.dialogRef.close({ action: 'new-app' } satisfies TDuplicatePkgDialogResult);
        },
      });
  }

  onChangePkg(): void {
    this.dialogRef.close({ action: 'change-pkg' } satisfies TDuplicatePkgDialogResult);
  }
}
