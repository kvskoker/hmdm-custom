import {
  Component,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDivider } from '@angular/material/divider';
import { BaseComponent, MatButtonModule, Selector, TranslatePipe } from 'hmdm-ui-kit';
import { APPLICATION_TYPE_OPTIONS } from '../../const/application-type-options.const';
import { ICON_APPLICATION_TYPES } from '../../const/icon-application-types.const';
import {
  TApplicationFormEmitValue,
  TApplicationFormValue,
} from '../../types/application-form.type';
import { TApplicationIconFormValue } from '../../types/application-icon-form.type';
import { ApkForm } from '../apk-form/apk-form';
import { ApplicationIconForm } from '../application-icon-form/application-icon-form';
import { SystemActionForm } from '../system-action-form/system-action-form';
import { WebPageForm } from '../web-page-form/web-page-form';
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { TApplicationType } from '../../../entity/application/types/application-type.type';

@Component({
  selector: 'core-application-form',
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    TranslatePipe,
    MatButtonModule,
    MatDivider,
    SystemActionForm,
    ApkForm,
    WebPageForm,
    ApplicationIconForm,
  ],
})
export class ApplicationForm extends BaseComponent implements OnInit {
  private readonly apkForm = viewChild(ApkForm);
  private readonly webPageForm = viewChild(WebPageForm);
  private readonly systemActionForm = viewChild(SystemActionForm);
  private readonly iconForm = viewChild(ApplicationIconForm);

  initialValue: InputSignal<TApplicationDTO | null> = input<TApplicationDTO | null>(null);

  formChange: OutputEmitterRef<TApplicationFormEmitValue | null> = output();

  typeControl = new FormControl<string | null>('app');
  typesOptions = APPLICATION_TYPE_OPTIONS;
  type: WritableSignal<TApplicationType> = signal<TApplicationType>('app');
  initialIconValue: WritableSignal<TApplicationIconFormValue | null> =
    signal<TApplicationIconFormValue | null>(null);

  iconFormValue: TApplicationIconFormValue | null = null;
  applicationFormValue: TApplicationFormValue | null = null;

  ngOnInit(): void {
    if (this.initialValue()) {
      this.typeControl.setValue(this.initialValue()!.type);
      this.typeControl.disable();
      this.type.set(this.initialValue()!.type as TApplicationType);

      this.initialIconValue.set({
        showIcon: !!this.initialValue()!.showIcon,
        iconId: this.initialValue()!.iconId || null,
        iconText: this.initialValue()!.iconText || null,
      });
      this.iconFormValue = this.initialIconValue();
    }

    this.typeControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      const type = (this.typeControl.value ?? 'app') as TApplicationType;

      this.type.set(type);
      this.applicationFormValue = null;

      if (ICON_APPLICATION_TYPES.includes(type)) {
        this.iconForm()?.setShowIcon(true);
      }

      this.emitFormChange();
    });
  }

  onUploadSuccess(): void {
    this.iconForm()?.setShowIcon(true);
  }

  onApplicationFormChange($event: TApplicationFormValue | null): void {
    this.applicationFormValue = $event;
    this.emitFormChange();
  }

  onIconFormChange($event: TApplicationIconFormValue | null): void {
    this.iconFormValue = $event;
    this.emitFormChange();
  }

  markAllAsTouched(): void {
    this.typeControl.markAsTouched();

    this.apkForm()?.formGroup.markAllAsTouched();
    this.webPageForm()?.formGroup.markAllAsTouched();
    this.systemActionForm()?.formGroup.markAllAsTouched();
    this.iconForm()?.formGroup.markAllAsTouched();
  }

  private emitFormChange(): void {
    if (!this.applicationFormValue) {
      this.formChange.emit(null);
      return;
    }

    const typeValue = this.typeControl.value;
    if (!typeValue) {
      this.formChange.emit(null);
      return;
    }

    if (this.iconForm()?.formGroup.invalid) {
      this.formChange.emit(null);
      return;
    }

    const iconData = {
      iconId: this.iconFormValue?.iconId ?? null,
      iconText: this.iconFormValue?.iconText ?? null,
      showIcon: this.iconFormValue?.showIcon ?? false,
    };

    const formValue: TApplicationFormEmitValue = {
      ...this.getEditedRecordFields(),
      ...this.applicationFormValue,
      ...iconData,
    };

    this.formChange.emit(formValue);
  }

  private getEditedRecordFields(): Partial<TApplicationDTO> {
    const initialValue = this.initialValue();

    if (!initialValue) {
      return {};
    }

    const { latestVersion, ...rest } = initialValue;

    return initialValue.type === EApplicationType.APP ? rest : initialValue;
  }
}
