import { Component } from '@angular/core';
import { DialogBase, DialogTemplate, MatButtonModule, TranslatePipe } from 'hmdm-ui-kit';
import { environment } from '../../../../environments/environment';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'core-about-dialog',
  templateUrl: './about-dialog.html',
  styleUrl: './about-dialog.scss',
  imports: [DialogTemplate, TranslatePipe, MatButtonModule, MatDivider],
})
export class AboutDialog extends DialogBase {
  plugins = (window as any)['__DYNPLUGINS__']
  version = environment.version;

  override onSave(): void {}
}
