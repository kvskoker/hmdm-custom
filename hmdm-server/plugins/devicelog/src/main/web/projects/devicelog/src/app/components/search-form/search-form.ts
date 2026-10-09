import { Component, inject, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AsyncSelectSearch,
  DateRange,
  DevicesNamesAutocompleteService,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  Selector,
  TranslatePipe,
  SelectSearch,
  ApplicationsAutocompleteService,
} from 'hmdm-ui-kit';
import { SEVERITY_OPTIONS } from '../../const/severity-options.const';
import { TSearchLogsForm } from '../../types/search-logs-form.type';

@Component({
  selector: 'logs-search-form',
  templateUrl: './search-form.html',
  styleUrl: './search-form.scss',
  imports: [
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    DateRange,
    Selector,
    TranslatePipe,
    AsyncSelectSearch,
  ],
})
export class LogsSearchForm {
  formGroup: InputSignal<FormGroup<TSearchLogsForm>> = input.required();
  deviceAutocompleteService = new DevicesNamesAutocompleteService();
  applicationsAutocompleteService = new ApplicationsAutocompleteService();

  severityOptions = SEVERITY_OPTIONS;
}
