import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AsyncSelectSearch,
  DevicesAutocompleteService,
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MatButtonModule,
  TranslatePipe,
  MatDivider,
  MatIconModule,
  TAutocompleteResponse,
  MAT_DIALOG_DATA,
} from 'hmdm-ui-kit';

@Component({
  selector: 'log-rule-devices-dialog',
  templateUrl: './rule-devices-dialog.html',
  styleUrl: './rule-devices-dialog.scss',
  imports: [
    TranslatePipe,
    DialogTemplate,
    DialogCommonButtons,
    AsyncSelectSearch,
    MatButtonModule,
    MatDivider,
    MatIconModule,
    ReactiveFormsModule,
  ],
})
export class RuleDevicesDialog extends DialogBase implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);

  devices: WritableSignal<TAutocompleteResponse[]> = signal([]);
  deviceAutocompleteService = new DevicesAutocompleteService('', 'name');
  deviceControl = new FormControl<TAutocompleteResponse | null>(null, [Validators.required]);

  ngOnInit(): void {
    if (this.data) {
      this.devices.set(this.data);
    }
  }

  override onSave(): void {
    this.dialogRef.close(this.devices());
  }

  onAddDevice(): void {
    const device = this.deviceControl.value;
    if (device && !this.devices().some((d) => d.id === device.id)) {
      this.devices.set([...this.devices(), device]);
      this.deviceControl.setValue(null);
      this.deviceControl.markAsPristine();
    }
  }

  onRemoveDevice(id: number): void {
    this.devices.set(this.devices().filter((device) => device.id !== id));
  }
}
