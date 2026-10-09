import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, Checkbox, Selector, TextInputComponent } from 'hmdm-ui-kit';
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { TApplicationType } from '../../../entity/application/types/application-type.type';
import { ApplicationIconFormConfig } from '../../configuration/application-icon-form.config';
import { ICON_APPLICATION_TYPES } from '../../const/icon-application-types.const';
import { IconDialogService } from '../../../settings/services/icon-dialog.service';
import { IconFacadeService } from '../../../settings/services/icon-facade.service';
import { TApplicationIconFormValue } from '../../types/application-icon-form.type';

@Component({
  selector: 'core-application-icon-form',
  templateUrl: './application-icon-form.html',
  styleUrl: './application-icon-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    TextInputComponent,
    Checkbox,
    TranslatePipe,
    MatButtonModule,
    MatIcon,
  ],
})
export class ApplicationIconForm extends BaseComponent implements OnInit {
  initialValue: InputSignal<TApplicationIconFormValue | null> =
    input<TApplicationIconFormValue | null>(null);
  applicationType: InputSignal<TApplicationType> = input<TApplicationType>(EApplicationType.APP);
  formChange: OutputEmitterRef<TApplicationIconFormValue | null> = output();

  private readonly iconDialogService = inject(IconDialogService);
  private readonly iconFacadeService = inject(IconFacadeService);
  private readonly applicationIconFormConfig = inject(ApplicationIconFormConfig);

  formGroup = this.applicationIconFormConfig.getFormGroup();
  iconsOptions = this.iconFacadeService.iconsOptions;
  isShowIcon: WritableSignal<boolean> = signal(false);

  isIconTextRequired: Signal<boolean> = computed(
    () => this.isShowIcon() && ICON_APPLICATION_TYPES.includes(this.applicationType()),
  );

  private readonly iconTextValidator = effect(() => {
    const iconText = this.formGroup.controls.iconText;

    if (this.isIconTextRequired()) {
      iconText.addValidators(Validators.required);
    } else {
      iconText.removeValidators(Validators.required);
    }

    iconText.updateValueAndValidity();
  });

  ngOnInit(): void {
    const initialValue = this.initialValue();

    if (initialValue) {
      this.formGroup.patchValue(initialValue);
      this.isShowIcon.set(!!initialValue.showIcon);
    }

    this.formGroup.controls.showIcon.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: (value) => {
        this.isShowIcon.set(!!value);
      },
    });

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => {
        const formValue = this.formGroup.valid ? this.formGroup.getRawValue() : null;
        this.formChange.emit(formValue);
      },
    });
  }

  setShowIcon(showIcon: boolean): void {
    this.formGroup.controls.showIcon.setValue(showIcon);
  }

  onNewIconClick(): void {
    this.iconDialogService.openIconDialog();
  }
}
