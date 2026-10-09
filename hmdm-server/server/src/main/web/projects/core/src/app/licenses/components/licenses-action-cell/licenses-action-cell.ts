import {Component, inject} from '@angular/core';
import {LicensesRestService} from '../../services/licenses-rest.service';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {HasPermissionDirective} from '../../../shared/directives/has-permission.directive';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {filter, take} from 'rxjs';
import {LicenseDeletionConfirmationDialog} from '../license-deletion-confirmation-dialog/license-deletion-confirmation-dialog';

@Component({
  selector: 'core-licenses-action-cell',
  imports: [
    HasPermissionDirective,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './licenses-action-cell.html',
  styleUrl: './licenses-action-cell.scss',
})
export class LicensesActionCell extends BaseCellRenderer<TLicensesRestDTO> {
  private readonly licensesService = inject(LicensesRestService);
  private readonly dialog = inject(MatDialog);

  onDeleteClick(): void {
    const license = this.params().data;

    if (!license) {
      return;
    }

    this.dialog
      .open(LicenseDeletionConfirmationDialog, {
        width: '450px'
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.licensesService.deleteLicense(license.id);
      });
  }
}
