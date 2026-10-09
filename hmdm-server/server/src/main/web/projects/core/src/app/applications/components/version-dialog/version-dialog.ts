import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import {
  DialogBase,
  DialogCommonButtons,
  DialogTemplate,
  MAT_DIALOG_DATA,
  MatButtonModule,
} from 'hmdm-ui-kit';
import { EApplicationArchitecture } from '../../../entity/application/enum/application-architecture.enum';
import { ApplicationService } from '../../../entity/application/services/application.service';
import { TCreateVersionRequest } from '../../../entity/application/types/create-version-request.type';
import { TUpdateVersionRequest } from '../../../entity/application/types/update-version-request.type';
import { TVersionDTO } from '../../../entity/application/types/version-dto.type';
import { TVersionFormValue } from '../../types/version-form.type';
import { AddVersionForm } from '../add-version-form/add-version-form';

@Component({
  selector: 'core-version-dialog',
  templateUrl: './version-dialog.html',
  styleUrl: './version-dialog.scss',
  imports: [AddVersionForm, DialogTemplate, MatButtonModule, CommonModule, DialogCommonButtons],
})
export class VersionDialog extends DialogBase implements OnInit {
  @ViewChild(AddVersionForm) versionForm!: AddVersionForm;

  private readonly applicationService = inject(ApplicationService);
  private readonly data = inject(MAT_DIALOG_DATA);

  initialData = this.data.version;

  saving = signal(false);

  isEdit = computed(() => !!this.data.version);

  currentVersion = computed(() => this.data.version || null);

  ngOnInit(): void {
    console.log('VersionDialog initialized with data:', this.data);
  }

  override onSave(): void {
    this.saving.set(true);

    try {
      const formData = this.getFormData();

      if (!formData) {
        throw new Error('Form data is invalid');
      }

      let result: TVersionDTO;
      if (this.isEdit()) {
        const request: TUpdateVersionRequest = {
          ...this.buildVersionRequest(formData),
          id: this.data.version.id,
        };

        this.applicationService.updateApplicationVersion(request).subscribe({
          next: (response) => {
            result = response;
            this.saving.set(false);
            this.dialogRef.close(result);
          },
          error: (error: any) => {
            this.saving.set(false);
          },
        });
      } else {
        const request: TCreateVersionRequest = this.buildVersionRequest(formData);

        this.applicationService.createApplicationVersion(request).subscribe({
          next: (response) => {
            result = response;
            this.saving.set(false);
            this.dialogRef.close(result);
          },
          error: (error: any) => {
            this.saving.set(false);
          },
        });
      }
    } catch (error: any) {
      this.saving.set(false);
    }
  }

  private getFormData(): TVersionFormValue | null {
    return this.versionForm?.getFormValue() || null;
  }

  get isFormInvalid(): boolean {
    const value = this.versionForm?.getFormValue();
    if (!value) {
      return true;
    }

    if (!value.url && !value.file) {
      return true;
    }

    return !this.versionForm?.isFormValid();
  }

  private buildVersionRequest(formData: TVersionFormValue): TCreateVersionRequest {
    const request: TCreateVersionRequest = {
      applicationId: this.data.applicationId || this.data.version?.applicationId || 0,
      version: formData.version,
      arch: formData.arch === EApplicationArchitecture.NONE ? null : formData.arch,
      autoUpdate: formData.autoUpdate,
    };

    if (formData.file) {
      // Get the uploaded file server path from the form component
      const serverPath = this.versionForm.getUploadedFileServerPath();
      if (serverPath) {
        request.filePath = serverPath;
      }
    } else if (formData.url) {
      request.url = formData.url;
    }

    return request;
  }
}
