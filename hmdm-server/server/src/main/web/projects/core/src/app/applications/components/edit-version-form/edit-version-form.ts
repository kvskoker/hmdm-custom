import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponent, Checkbox, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { TVersionDTO } from '../../../entity/application/types/version-dto.type';
import { EditVersionFormConfig } from '../../configuration/edit-version-form.configuration';
import { TEditVersionFormValue } from '../../types/edit-version-form.type';

@Component({
  selector: 'core-edit-version-form',
  templateUrl: './edit-version-form.html',
  styleUrl: './edit-version-form.scss',
  imports: [ReactiveFormsModule, TextInputComponent, TranslatePipe, Checkbox],
})
export class EditVersionForm extends BaseComponent implements OnInit {
  formChange: OutputEmitterRef<TEditVersionFormValue | null> = output();

  initialData: InputSignal<TVersionDTO> = input.required();

  private readonly editVersionFormConfig = inject(EditVersionFormConfig);

  formGroup = this.editVersionFormConfig.getFormGroup();

  ngOnInit(): void {
    const data = this.initialData();
    const isSplitApk = data.split;

    this.formGroup.patchValue({
      version: data.version,
      split: isSplitApk,
      url: isSplitApk ? '' : data.url || '',
      urlArm64: isSplitApk ? data.urlArm64 || '' : '',
      urlArmeabi: isSplitApk ? data.urlArmeabi || '' : '',
    });

    this.formGroup.controls.split.valueChanges.pipe(this.untilDestroyed()).subscribe((split) => {
      if (split) {
        this.formGroup.controls.url.setValue('');
      } else {
        this.formGroup.controls.urlArm64.setValue('');
        this.formGroup.controls.urlArmeabi.setValue('');
      }
    });

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const value = this.formGroup.getRawValue();

      if (this.formGroup.invalid) {
        this.formChange.emit(null);
        return;
      }

      if (value.split && (!value.urlArm64 || !value.urlArmeabi)) {
        this.formChange.emit(null);
        return;
      }

      if (!value.split && !value.url) {
        this.formChange.emit(null);
        return;
      }

      this.formChange.emit(value);
    });
  }

  isSplitApk(): boolean {
    return this.formGroup.controls.split?.value || false;
  }
}
