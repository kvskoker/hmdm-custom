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
import { BaseComponent, Selector, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { SystemActionFormConfig } from '../../configuration/system-action-form.config';
import { SYSTEM_ACTIONS_OPTIONS } from '../../const/system-actions-options.const';
import { TApplicationIntentValue } from '../../types/application-form.type';

@Component({
  selector: 'core-system-action-form',
  templateUrl: './system-action-form.html',
  styleUrl: './system-action-form.scss',
  imports: [TextInputComponent, Selector, TranslatePipe, ReactiveFormsModule],
})
export class SystemActionForm extends BaseComponent implements OnInit {
  initialValue: InputSignal<TApplicationDTO | null> = input<TApplicationDTO | null>(null);

  formChange: OutputEmitterRef<TApplicationIntentValue | null> = output();

  private readonly systemActionFormConfig = inject(SystemActionFormConfig);

  formGroup = this.systemActionFormConfig.getFormGroup();
  actionsOptions = SYSTEM_ACTIONS_OPTIONS;

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue && initialValue.type === EApplicationType.INTENT) {
      this.formGroup.patchValue({
        name: initialValue.name,
        intent: initialValue.intent ?? '',
      });
    }

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => this.emitFormChange(),
    });

    if (initialValue && initialValue.type === EApplicationType.INTENT) {
      this.emitFormChange();
    }
  }

  private emitFormChange(): void {
    if (this.formGroup.invalid) {
      this.formChange.emit(null);
      return;
    }

    const value = this.formGroup.getRawValue();

    this.formChange.emit({
      type: EApplicationType.INTENT,
      ...value,
    });
  }
}
