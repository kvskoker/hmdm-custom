import { Component } from '@angular/core';
import { DialogBase, DialogTemplate, MatButtonModule, TranslatePipe } from 'hmdm-ui-kit';

@Component({
  selector: 'core-qr-help-dialog',
  templateUrl: './qr-help-dialog.html',
  styleUrl: './qr-help-dialog.scss',
  imports: [DialogTemplate, TranslatePipe, MatButtonModule],
})
export class QrHelpDialog extends DialogBase {
  override onSave(): void {}
}
