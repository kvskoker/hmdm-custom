import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTemplate } from '../dialog-template/dialog-template';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  imports: [DialogTemplate, MatButtonModule, TranslateDirective, TranslatePipe],
})
export class ConfirmDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  data = inject(MAT_DIALOG_DATA);

  onSave(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
