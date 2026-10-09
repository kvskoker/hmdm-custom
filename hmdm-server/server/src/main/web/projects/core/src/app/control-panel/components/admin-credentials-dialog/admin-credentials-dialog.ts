import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogBase, DialogTemplate } from 'hmdm-ui-kit';

@Component({
  selector: 'core-admin-credentials-dialog',
  templateUrl: './admin-credentials-dialog.html',
  styleUrl: './admin-credentials-dialog.scss',
  imports: [DialogTemplate, MatButtonModule, TranslatePipe],
})
export class AdminCredentialsDialog extends DialogBase {
  readonly credentials: { login: string; password: string } = inject(MAT_DIALOG_DATA);

  onSave(): void {}
}
