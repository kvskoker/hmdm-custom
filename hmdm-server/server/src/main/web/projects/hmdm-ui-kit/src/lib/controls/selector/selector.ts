import { Component, computed, input, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionSelectionChange, MatPseudoCheckbox } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { TOption } from '../../shared/types/option.type';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'hmdm-selector',
  templateUrl: './selector.html',
  styleUrls: ['../controls-style.scss', './selector.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatPseudoCheckbox,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    ErrorMessage,
    HelpTooltip,
    MatIconModule,
  ],
})
export class Selector extends BaseControlValueAccessor<TOption<unknown>> {
  options = input<TOption<unknown>[]>();
  optional = input<boolean>(false);
  multi = input<boolean>(false);

  private readonly currentValue = signal<unknown>(null);

  constructor() {
    super();
    this.formControl.valueChanges
      .pipe(this.untilDestroyed())
      .subscribe((value) => this.currentValue.set(value));
  }

  override writeValue(value: TOption<unknown>): void {
    super.writeValue(value);
    this.currentValue.set(value);
  }

  readonly isAllSelected = computed(() => {
    const opts = this.options() ?? [];
    const vals = this.currentValue();
    if (opts.length === 0 || !Array.isArray(vals)) return false;
    return opts.every((opt) => vals.includes(opt.value));
  });

  readonly isSomeSelected = computed(() => {
    const opts = this.options() ?? [];
    const vals = this.currentValue();
    if (!Array.isArray(vals) || vals.length === 0 || opts.length === 0) return false;
    const matchCount = opts.filter((opt) => vals.includes(opt.value)).length;
    return matchCount > 0 && matchCount < opts.length;
  });

  readonly selectAllState = computed((): 'checked' | 'indeterminate' | 'unchecked' =>
    this.isAllSelected() ? 'checked' : this.isSomeSelected() ? 'indeterminate' : 'unchecked',
  );

  onSelectAllChange(event: MatOptionSelectionChange): void {
    if (!event.isUserInput) return;
    const nextValue = this.isAllSelected() ? [] : (this.options() ?? []).map((o) => o.value);
    queueMicrotask(() => {
      this.formControl.setValue(nextValue as any);
    });
  }
}
