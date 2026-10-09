import { Component, inject } from '@angular/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
} from 'hmdm-ui-kit';
import { EApplicationArchitecture } from '../../../entity/application/enum/application-architecture.enum';
import { TUpdateVersionRequest } from '../../../entity/application/types/update-version-request.type';
import { TEditVersionFormValue } from '../../types/edit-version-form.type';
import { EditVersionForm } from '../edit-version-form/edit-version-form';

@Component({
  selector: 'core-edit-version-dialog',
  templateUrl: './edit-version-dialog.html',
  styleUrl: './edit-version-dialog.scss',
  imports: [DialogTemplate, EditVersionForm, MatButtonModule, DialogCommonButtons],
})
export class EditVersionDialog extends DialogBase {
  private readonly data = inject(MAT_DIALOG_DATA);
  private formData: TEditVersionFormValue | null = null;

  initialData = this.data.version;

  override onSave(): void {
    if (!this.formData) {
      this.dialogRef.close(false);
      return;
    }

    const request: TUpdateVersionRequest = {
      ...this.formData,
      id: this.data.version.id,
      applicationId: this.data.version.applicationId,
      arch: this.data?.arch === EApplicationArchitecture.NONE ? null : this.data?.arch,
      version: this.data.version.version,
      url: this.formData.url || null,
      urlArm64: this.formData.urlArm64 || null,
      urlArmeabi: this.formData.urlArmeabi || null,
    };

    this.dialogRef.close(request);
  }

  onFormChange($event: TEditVersionFormValue | null) {
    this.formData = $event;
  }

  get isFormInvalid(): boolean {
    return this.formData === null;
  }
}
