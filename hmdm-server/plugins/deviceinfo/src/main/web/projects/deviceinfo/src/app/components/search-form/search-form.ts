import { Component, input, InputSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TSearchForm } from '../../types/search-form.type';
import { Selector, TranslatePipe, DateRange, Timepicker, PersistFormDirective } from 'hmdm-ui-kit';
import { INTERVAL_OPTIONS } from '../../const/interval-options.const';

@Component({
  selector: 'di-search-form',
  templateUrl: './search-form.html',
  styleUrl: './search-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    TranslatePipe,
    DateRange,
    Timepicker,
    PersistFormDirective,
  ],
})
export class SearchForm {
  formGroup: InputSignal<FormGroup<TSearchForm>> = input.required();

  intervalOptions = INTERVAL_OPTIONS;

  get interval(): FormControl<number> {
    return this.formGroup().controls.interval;
  }
}
