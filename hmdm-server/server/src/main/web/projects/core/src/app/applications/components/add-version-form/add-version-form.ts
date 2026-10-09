import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  Checkbox,
  FileInputComponent,
  Selector,
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { VersionFormConfig } from '../../configuration/version-form.config';
import { APPLICATION_ARCHITECTURE_OPTIONS } from '../../const/application-architecture-options.const';
import { TVersionFormValue } from '../../types/version-form.type';
import { ApplicationService } from '../../../entity/application/services/application.service';
import { TFileUploadResult } from '../../../entity/application/types/file-upload-result.type';

@Component({
  selector: 'core-add-version-form',
  templateUrl: './add-version-form.html',
  styleUrl: './add-version-form.scss',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    Selector,
    FileInputComponent,
    Checkbox,
    TranslatePipe,
  ],
})
export class AddVersionForm implements OnInit {
  private readonly versionFormConfig = inject(VersionFormConfig);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroy$ = new Subject<void>();

  formGroup = this.versionFormConfig.getFormGroup();

  architectureOptions = APPLICATION_ARCHITECTURE_OPTIONS;

  uploadProgress = signal(0);
  uploading = signal(false);
  fileSelected = signal(false);
  fileName = signal<string | null>(null);
  uploadedFileServerPath = signal<string | null>(null);
  apkDetails = signal<TFileUploadResult | null>(null);
  uploadError = signal<string | null>(null);

  ngOnInit(): void {
    this.formGroup
      .get('file')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((file: File | null) => {
        if (file) {
          this.onFileSelected(file);
        } else {
          this.onFileCleared();
        }
      });
  }

  getFormValue(): TVersionFormValue | null {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return null;
    }
    return this.formGroup.value as TVersionFormValue;
  }

  isFormValid(): boolean {
    return this.formGroup.valid;
  }

  onFileSelected(file: File): void {
    this.fileSelected.set(true);
    this.fileName.set(file.name);
    this.uploading.set(true);
    this.uploadError.set(null);

    this.formGroup.patchValue({ url: '' });

    this.applicationService.uploadFile(file).subscribe({
      next: (uploadResult) => {
        this.uploading.set(false);
        this.uploadProgress.set(100);
        this.uploadedFileServerPath.set(uploadResult.serverPath);
        this.apkDetails.set(uploadResult);

        if (uploadResult.fileDetails) {
          this.formGroup.patchValue({
            version: uploadResult.fileDetails.version,
            arch: uploadResult.fileDetails.arch || '',
          });
        }
      },
      error: (error) => {
        console.error('File upload failed:', error);
        this.uploading.set(false);
        this.uploadProgress.set(0);
        this.uploadError.set('Upload failed. Please try again.');
        this.onFileCleared();
      },
    });
  }

  onFileCleared(): void {
    this.fileSelected.set(false);
    this.fileName.set(null);
    this.uploadedFileServerPath.set(null);
    this.apkDetails.set(null);
    this.uploadProgress.set(0);
    this.uploading.set(false);
    this.uploadError.set(null);
  }

  onUploadProgress(progress: number): void {
    this.uploadProgress.set(progress);
    this.uploading.set(progress > 0 && progress < 100);
  }

  getUploadedFileServerPath(): string | null {
    return this.uploadedFileServerPath();
  }

  getAPKDetails(): TFileUploadResult | null {
    return this.apkDetails();
  }
}
