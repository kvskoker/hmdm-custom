import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-date-range',
  templateUrl: './date-range.html',
  styleUrls: ['../controls-style.scss', './date-range.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSuffix,
    HelpTooltip,
  ],
})
export class DateRange extends BaseControlValueAccessor<any> implements OnInit {
  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.range.valueChanges.pipe(this.untilDestroyed()).subscribe((value) => {
      this.formControl.setValue(value);
    });
  }

  override writeValue(value: TDateRangeWrite): void {
    if (value?.start) {
      const date = new Date(value.start);
      this.range.controls.start.setValue(date, { emitEvent: false });
    }

    if (value?.end) {
      const date = new Date(value.end);
      this.range.controls.end.setValue(date, { emitEvent: false });
    }

    if (value && this.isFirstWrite) {
      this.isFirstWrite = false;

      setTimeout(() => {
        this.formControl.markAsTouched();
      });
    }
  }

  onClear() {
    this.range.reset();
  }
}

export type TDateRange = {
  start: Date | null;
  end: Date | null;
};

export type TDateRangeWrite = {
  start: string | null;
  end: string | null;
};
