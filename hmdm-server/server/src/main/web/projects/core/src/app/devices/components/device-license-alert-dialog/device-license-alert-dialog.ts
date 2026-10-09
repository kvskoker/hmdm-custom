import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogTemplate} from 'hmdm-ui-kit';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'core-device-license-alert-dialog',
  imports: [
    DialogTemplate,
    TranslatePipe,
    MatButton
  ],
  templateUrl: './device-license-alert-dialog.html',
  styleUrl: './device-license-alert-dialog.scss',
})
export class DeviceLicenseAlertDialog {
  public readonly dialogRef = inject(MatDialogRef<DeviceLicenseAlertDialog>);
}
