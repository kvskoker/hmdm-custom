import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { map, take } from 'rxjs';
import { ConfigurationDetailsFacadeService } from '../../configurations/services/configuration-details-facade.service';

export const unsavedConfigurationGuard: CanDeactivateFn<unknown> = () => {
  const configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);
  const dialog = inject(MatDialog);

  if (!configurationDetailsFacadeService.hasUnsavedChanges()) {
    return true;
  }

  return dialog
    .open(ConfirmDialog, {
      data: {
        message: 'question.exit.without.saving',
        confirmButtonText: 'button.yes',
        cancelButtonText: 'button.cancel',
      },
    })
    .afterClosed()
    .pipe(take(1), map(Boolean));
};
