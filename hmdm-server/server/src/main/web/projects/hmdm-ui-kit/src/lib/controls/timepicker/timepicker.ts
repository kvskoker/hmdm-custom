import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-timepicker',
  templateUrl: './timepicker.html',
  styleUrls: ['../controls-style.scss', './timepicker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatTimepickerModule,
    ErrorMessage,
    HelpTooltip,
  ],
})
export class Timepicker extends BaseControlValueAccessor<any> {
  timeString: InputSignal<boolean> = input<boolean>(false);

  override writeValue(value: unknown): void {
    super.writeValue(this.timeString() ? toDate(value) : value);
  }

  override registerOnChange(fn: (value: unknown) => void): void {
    super.registerOnChange((value: unknown) => fn(this.timeString() ? toTimeString(value) : value));
  }
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  const match = typeof value === 'string' ? /^(\d{1,2}):(\d{2})$/.exec(value.trim()) : null;

  if (!match) {
    return null;
  }

  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);

  return date;
}

function toTimeString(value: unknown): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return `${value.getHours()}`.padStart(2, '0') + ':' + `${value.getMinutes()}`.padStart(2, '0');
}
