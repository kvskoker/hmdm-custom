import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TRuleForm } from '../../types/rule-form.type';
import {
  TextInputComponent,
  TranslatePipe,
  BooleanCell,
  Checkbox,
  Selector,
  AsyncSelectSearch,
  ApplicationsAutocompleteService,
  GroupsAutocompleteService,
  ConfigurationsAutocompleteService,
} from 'hmdm-ui-kit';
import { SEVERITY_NAME_OPTIONS } from '../../const/severity-name-options.const';

@Component({
  selector: 'log-rule-form',
  templateUrl: './rule-form.html',
  styleUrl: './rule-form.scss',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    TranslatePipe,
    Checkbox,
    Selector,
    AsyncSelectSearch,
  ],
})
export class RuleForm {
  formGroup: InputSignal<FormGroup<TRuleForm>> = input.required();

  severityOptions = SEVERITY_NAME_OPTIONS;
  applicationsAutocompleteService = new ApplicationsAutocompleteService('id', 'name');
  groupsAutocompleteService = new GroupsAutocompleteService('id', 'name');
  configurationsAutocompleteService = new ConfigurationsAutocompleteService('id', 'name');
}
