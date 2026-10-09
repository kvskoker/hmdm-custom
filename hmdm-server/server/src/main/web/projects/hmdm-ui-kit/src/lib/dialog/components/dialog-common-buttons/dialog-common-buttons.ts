import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hmdm-dialog-common-buttons',
  templateUrl: './dialog-common-buttons.html',
  styleUrl: './dialog-common-buttons.scss',
  imports: [MatButtonModule, TranslatePipe],
})
export class DialogCommonButtons {
  isSaveDisabled: InputSignal<boolean> = input<boolean>(false);
  isCancelDisabled: InputSignal<boolean> = input<boolean>(false);
  cancelText: InputSignal<string> = input<string>('button.cancel');
  saveText: InputSignal<string> = input<string>('button.save');

  cancel: OutputEmitterRef<void> = output();
  save: OutputEmitterRef<void> = output();

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    this.save.emit();
  }
}
