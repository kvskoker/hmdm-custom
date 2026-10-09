import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'core-license-deletion-confirmation-dialog',
  imports: [
    MatButton,
    TranslatePipe
  ],
  templateUrl: './license-deletion-confirmation-dialog.html',
  styleUrl: './license-deletion-confirmation-dialog.scss',
})
export class LicenseDeletionConfirmationDialog {
  private readonly dialogRef = inject(MatDialogRef<LicenseDeletionConfirmationDialog>);

  close(action: boolean) {
    this.dialogRef.close(action);
  }
}
