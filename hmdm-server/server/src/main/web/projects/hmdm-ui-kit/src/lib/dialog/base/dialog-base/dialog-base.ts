import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { BaseComponent } from '../../../../public-api';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'hmdm-dialog-base',
  template: '', // Abstract base class does not have a template
})
export abstract class DialogBase extends BaseComponent {
  protected readonly dialog: MatDialog = inject(MatDialog);
  protected readonly dialogRef: MatDialogRef<DialogBase> = inject(MatDialogRef<DialogBase>);

  onCancel(): void {
    if (this.requireConfirmation()) {
      this.dialog
        .open(ConfirmDialog)
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          if (result) {
            this.closeDialog();
          }
        });
      return;
    }

    this.closeDialog();
  }

  // Override this method in derived classes to require confirmation on cancel
  requireConfirmation(): boolean {
    return false;
  }

  abstract onSave(): void;

  private closeDialog(): void {
    this.dialogRef.close();
  }
}
