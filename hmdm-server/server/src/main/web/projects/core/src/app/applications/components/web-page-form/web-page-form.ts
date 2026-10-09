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
import { EApplicationType } from '../../../entity/application/enum/application-type.enum';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { WebPageFormConfig } from '../../configuration/web-page-form.config';
import { TApplicationWebValue } from '../../types/application-form.type';

@Component({
  selector: 'core-web-page-form',
  templateUrl: './web-page-form.html',
  styleUrl: './web-page-form.scss',
  imports: [Checkbox, ReactiveFormsModule, TextInputComponent, TranslatePipe],
})
export class WebPageForm extends BaseComponent implements OnInit {
  initialValue: InputSignal<TApplicationDTO | null> = input<TApplicationDTO | null>(null);

  formChange: OutputEmitterRef<TApplicationWebValue | null> = output();

  private readonly webPageFormConfig = inject(WebPageFormConfig);

  formGroup = this.webPageFormConfig.getFormGroup();

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue && initialValue.type === EApplicationType.WEB) {
      this.formGroup.patchValue({
        name: initialValue.name,
        url: initialValue.url ?? '',
      });
      this.formGroup.markAllAsTouched();
    }

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => this.emitFormChange(),
    });

    if (initialValue && initialValue.type === EApplicationType.WEB) {
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
      type: EApplicationType.WEB,
      ...value,
    });
  }
}
