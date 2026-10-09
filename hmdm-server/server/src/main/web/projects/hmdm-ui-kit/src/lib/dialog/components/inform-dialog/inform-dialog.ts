import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTemplate } from '../dialog-template/dialog-template';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-inform-dialog',
  templateUrl: './inform-dialog.html',
  styleUrl: './inform-dialog.scss',
  imports: [DialogTemplate, MatButtonModule, TranslateDirective, TranslatePipe],
})
export class InformDialog {
  private readonly dialogRef = inject(MatDialogRef<InformDialog>);
  data = inject(MAT_DIALOG_DATA);

  onOk(): void {
    this.dialogRef.close();
  }
}
