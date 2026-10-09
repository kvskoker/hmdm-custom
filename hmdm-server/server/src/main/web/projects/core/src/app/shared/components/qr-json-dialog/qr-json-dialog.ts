import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  DialogBase,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { QrFacadeService } from '../../services/qr-facade.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'core-qr-json-dialog',
  templateUrl: './qr-json-dialog.html',
  styleUrl: './qr-json-dialog.scss',
  imports: [
    DialogTemplate,
    MatButtonModule,
    TranslatePipe,
    MatCardModule,
    MatInputModule,
    JsonPipe,
    CdkTextareaAutosize,
  ],
})
export class QrJsonDialog extends DialogBase implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly qrService = inject(QrFacadeService);

  jsonData: WritableSignal<any> = signal(null);

  ngOnInit(): void {
    this.fetchJsonData();
  }

  override onSave(): void {}

  private fetchJsonData(): void {
    this.qrService
      .fetchQrCodeJson(this.data.qrCodeKey, {
        deviceId: this.data.deviceId || undefined,
        create: this.data.create,
        groups: this.data.groups || [],
        useId: this.data.useId || '',
      })
      .pipe(this.untilDestroyed())
      .subscribe((data) => {
        if (!data || Object.keys(data).length === 0) {
          this.jsonData.set(null);
          return;
        }
        this.jsonData.set(data);
      });
  }
}
