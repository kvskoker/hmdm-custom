import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AsyncSelectSearch,
  DateRange,
  DevicesNamesAutocompleteService,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { TSearchMessagesForm } from '../../types/search-messages-form.type';

@Component({
  selector: 'push-search-form',
  templateUrl: './search-form.html',
  styleUrl: './search-form.scss',
  imports: [ReactiveFormsModule, AsyncSelectSearch, DateRange, TranslatePipe],
})
export class SearchForm {
  formGroup: InputSignal<FormGroup<TSearchMessagesForm>> = input.required();
  deviceAutocompleteService = new DevicesNamesAutocompleteService();
}
