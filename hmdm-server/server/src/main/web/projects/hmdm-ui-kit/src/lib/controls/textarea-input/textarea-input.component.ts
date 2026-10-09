import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-textarea-input',
  templateUrl: './textarea-input.component.html',
  styleUrls: ['../controls-style.scss', './textarea-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInputModule,
    ErrorMessage,
    HelpTooltip,
  ],
})
export class TextAreaInputComponent extends BaseControlValueAccessor<string> {
  inputType: InputSignal<string> = input<string>('text');
  placeholder: InputSignal<string> = input<string>('');
  rows: InputSignal<number> = input<number>(3);
}
