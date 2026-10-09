import {Component, input, InputSignal} from '@angular/core';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  AsyncSelectSearch,
  DateRange,
  DevicesAutocompleteService,
  Selector
} from "hmdm-ui-kit";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'core-alerts-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Selector,
    TranslatePipe,
    DateRange,
    AsyncSelectSearch
  ],
  templateUrl: './alerts-form.html',
  styleUrl: './alerts-form.scss',
})
export class AlertsForm {
  formGroup: InputSignal<FormGroup> = input.required();
  severityOptions = [
    { value: 10, viewValue: 'table.lable.alerts.info' },
    { value: 20, viewValue: 'table.lable.alerts.warning' },
    { value: 30, viewValue: 'table.lable.alerts.severe' }
  ];
  deviceAutocompleteService = new DevicesAutocompleteService('id');
}
