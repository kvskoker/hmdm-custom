import { Component, inject, input, InputSignal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'hmdm-dialog-template',
  templateUrl: './dialog-template.html',
  styleUrl: './dialog-template.scss',
  imports: [],
})
export class DialogTemplate {
  title: InputSignal<string> = input<string>('');

  dialogRef = inject(MatDialogRef<DialogTemplate>);
}
