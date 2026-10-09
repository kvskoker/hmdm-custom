import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Checkbox,
  DialogBase,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
  MatCardModule,
  Selector,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime } from 'rxjs';
import { QrFormConfig } from '../../config/qr-form.config';
import { QR_NUMBER_OPTIONS } from '../../const/qr-number-options.const';
import { GroupService } from '../../services/group.service';
import { QrFacadeService } from '../../services/qr-facade.service';

@Component({
  selector: 'core-qr-dialog',
  templateUrl: './qr-dialog.html',
  styleUrl: './qr-dialog.scss',
  imports: [
    DialogTemplate,
    MatButtonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TranslatePipe,
    Selector,
    Checkbox,
    MatCardModule,
  ],
})
export class QrDialog extends DialogBase implements OnInit {
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly qrFormConfig = inject(QrFormConfig);
  private readonly groupService = inject(GroupService);
  private readonly qrService = inject(QrFacadeService);

  url: WritableSignal<string> = signal('');
  formGroup = this.qrFormConfig.getFormGroup();
  useIdOptions = QR_NUMBER_OPTIONS;
  groupsOptions = this.groupService.groupsOptions;
  optimalSize = this.qrService.calculateOptimalSize();

  ngOnInit(): void {
    if (this.data.deviceId) {
      this.formGroup.patchValue({ deviceId: this.data.deviceId });
      this.formGroup.controls.useId.reset();
      this.formGroup.controls.useId.disable();
    }

    this.url.set(
      this.qrService.buildQrCodeUrl({
        qrCodeKey: this.data.qrCodeKey,
        deviceId: this.data.deviceId || null,
        params: this.data.params || {},
      }),
    );

    this.formGroup.controls.deviceId.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const value = this.formGroup.controls.deviceId.value;

      if (value) {
        this.formGroup.controls.useId.reset();
        this.formGroup.controls.useId.disable();
      } else {
        this.formGroup.controls.useId.enable();
      }
    });

    this.formGroup.valueChanges.pipe(this.untilDestroyed(), debounceTime(300)).subscribe(() => {
      this.updateQrCodeUrl();
    });
  }

  override onSave(): void {}

  onGetHelp(): void {
    this.qrService.openHelpDialog();
  }

  onGetJson(): void {
    const form = this.formGroup.getRawValue();
    this.qrService.openQrJsonDialog({
      qrCodeKey: this.data.qrCodeKey,
      deviceId: form.deviceId || undefined,
      create: form.create,
      groups: form.groups || [],
      useId: form.useId || '',
    });
  }

  private updateQrCodeUrl(): void {
    const form = this.formGroup.getRawValue();
    this.url.set(
      this.qrService.buildQrCodeUrl({
        qrCodeKey: this.data.qrCodeKey,
        deviceId: form.deviceId || null,
        params: {
          ...this.data.params,
          create: form.create,
          groups: form.groups || [],
          useId: form.useId || '',
        },
      }),
    );
  }
}
