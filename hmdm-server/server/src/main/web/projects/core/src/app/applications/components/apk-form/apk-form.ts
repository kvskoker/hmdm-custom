import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BaseComponent,
  Checkbox,
  FileInputComponent,
  MatIconModule,
  TextInputComponent,
} from 'hmdm-ui-kit';
import { filter, finalize, Subject, takeUntil, tap } from 'rxjs';
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { ApkFormConfig } from '../../configuration/apk-form.config';
import { TApplicationAppValue } from '../../types/application-form.type';
import { APPLICATION_ARCHITECTURE_OPTIONS } from '../../const/application-architecture-options.const';
import { EApplicationArchitecture } from '../../../entity/application/enum/application-architecture.enum';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ApplicationService } from '../../../entity/application/services/application.service';
import { TFileUploadResult } from '../../../entity/application/types/file-upload-result.type';
import { SettingsFacadeService } from '../../../shared/services/settings-facade.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

@Component({
  selector: 'core-apk-form',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    Checkbox,
    TranslatePipe,
    FileInputComponent,
    MatProgressBarModule,
    MatIconModule,
  ],
  templateUrl: './apk-form.html',
  styleUrl: './apk-form.scss',
})
export class ApkForm extends BaseComponent implements OnInit {
  initialValue: InputSignal<TApplicationDTO | null> = input<TApplicationDTO | null>(null);

  formChange: OutputEmitterRef<NoInfer<TApplicationAppValue | null>> = output();
  uploadSuccess: OutputEmitterRef<void> = output();

  private readonly applicationService = inject(ApplicationService);
  private readonly apkFormConfig = inject(ApkFormConfig);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly snackBarService = inject(SnackBarService);

  architectureOptions = APPLICATION_ARCHITECTURE_OPTIONS;
  formGroup = this.apkFormConfig.getFormGroup();

  uploadProgress: WritableSignal<number | null> = signal(null);
  uploadStatus: WritableSignal<UploadStatus> = signal('idle');
  versionExists: WritableSignal<boolean> = signal(false);

  availableSpaceWarning = computed(() => {
    const limit = this.settingsFacadeService.storageLimit();
    const settings = this.settingsFacadeService.settings();
    if (!limit || !settings || settings.sizeLimit <= 0) return null;
    const available = Math.max(0, limit.sizeLimit - limit.sizeUsed);
    return available < 100 ? available : null;
  });

  private uploadResult: TFileUploadResult | null = null;
  private readonly uploadAbort$ = new Subject<void>();

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue && initialValue.type === EApplicationType.APP) {
      const value = {
        ...initialValue,
        arch: initialValue.arch || EApplicationArchitecture.NONE,
      };
      this.formGroup.patchValue({ ...value, url: '', file: null });
      this.formGroup.controls.version.disable();
      this.formGroup.controls.arch.disable();
    }

    this.initFormListeners();

    if (initialValue && initialValue.type === EApplicationType.APP) {
      this.emitFormChange();
    }
  }

  private emitFormChange(): void {
    if (this.uploadStatus() === 'uploading') {
      this.formChange.emit(null);
      return;
    }

    if (this.formGroup.invalid) {
      this.formChange.emit(null);
      return;
    }

    const value = this.formGroup.getRawValue();

    this.formChange.emit({
      type: EApplicationType.APP,
      ...value,
      filePath: this.uploadResult?.serverPath ?? '',
      versionCode: this.uploadResult?.fileDetails?.versionCode,
      versionExists: this.versionExists(),
    });
  }

  private initFormListeners(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => this.emitFormChange(),
    });

    this.formGroup.controls.system.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => {
        const isSystemApp = this.formGroup.controls.system.value;

        if (isSystemApp) {
          this.formGroup.controls.runAfterInstall.disable();
          this.formGroup.controls.url.setValue('');
          this.formGroup.controls.url.disable();
          this.formGroup.controls.file.setValue(null);
          this.formGroup.controls.file.disable();
        } else {
          this.formGroup.controls.runAfterInstall.enable();
          this.formGroup.controls.url.enable();
          this.formGroup.controls.file.enable();
        }
      },
    });

    this.formGroup.controls.file.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: (rawFile) => {
        const file = rawFile as File | null;
        this.uploadAbort$.next();

        if (!file) {
          this.uploadResult = null;
          this.uploadProgress.set(null);
          this.versionExists.set(false);
          return;
        }

        this.uploadStatus.set('uploading');
        this.uploadProgress.set(0);
        this.versionExists.set(false);
        this.formChange.emit(null);

        this.applicationService
          .uploadFileWithProgress(file)
          .pipe(
            this.untilDestroyed(),
            takeUntil(this.uploadAbort$),
            tap((event) => {
              if (typeof event !== 'number') {
                return;
              }

              this.uploadProgress.set(event);

              if (event >= 100) {
                this.uploadStatus.set('processing');
              }
            }),
            filter((event): event is TFileUploadResult => typeof event !== 'number'),
            finalize(() => {
              this.uploadProgress.set(null);
              if (this.uploadStatus() === 'uploading' || this.uploadStatus() === 'processing') {
                this.uploadStatus.set('idle');
              }
            }),
          )
          .subscribe({
            next: (result) => {
              this.uploadStatus.set('success');
              this.uploadResult = result;

              if (result.fileDetails) {
                this.formGroup.patchValue({
                  pkg: result.fileDetails.pkg,
                  name: result.fileDetails.name,
                  version: result.fileDetails.version,
                  arch: result.fileDetails.arch ?? EApplicationArchitecture.NONE,
                });
                this.formGroup.controls.pkg.disable();
                this.formGroup.controls.version.disable();
              }

              if (result.exists) {
                this.versionExists.set(true);
              }

              this.uploadSuccess.emit();
            },
            error: (err) => {
              this.uploadStatus.set('error');
              this.snackBarService.error(err?.message || 'error.size.limit.exceeded');
            },
          });
      },
    });
  }
}
