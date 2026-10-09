import { Component, input, InputSignal } from '@angular/core';
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
} from 'hmdm-ui-kit';
import { STATUS_OPTIONS } from '../../const/status-option.const';
import { TSearchMessagesForm } from '../../types/search-messages-form.type';

@Component({
  selector: 'messaging-search-form',
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
export class SearchForm {
  formGroup: InputSignal<FormGroup<TSearchMessagesForm>> = input.required();
  deviceAutocompleteService = new DevicesNamesAutocompleteService();

  statusOptions = STATUS_OPTIONS;
}
