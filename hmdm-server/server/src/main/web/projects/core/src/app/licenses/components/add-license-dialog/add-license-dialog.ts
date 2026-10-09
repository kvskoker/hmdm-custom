import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {TextAreaInputComponent} from 'hmdm-ui-kit';

@Component({
  selector: 'core-add-license-dialog',
  templateUrl: './add-license-dialog.html',
  styleUrl: './add-license-dialog.scss',
  imports: [
    TranslatePipe,
    MatButton,
    TextAreaInputComponent,
    ReactiveFormsModule
  ],
})
export class AddLicenseDialog {
  private readonly dialogRef = inject(MatDialogRef<AddLicenseDialog>);

  licenseKeyControl: FormControl<string> = new FormControl('', {nonNullable: true});

  submit() {
    this.dialogRef.close(this.licenseKeyControl.value);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
