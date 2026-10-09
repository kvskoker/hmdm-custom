import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AsyncSelectSearch,
  BaseComponent,
  ConfigurationsOptionsService,
  DevicesNamesAutocompleteService,
  GroupsOptionsService,
  Selector,
  TextAreaInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { SCOPE_OPTIONS } from '../../const/scope-options.const';
import { TMessageForm } from '../../types/message-form.type';

@Component({
  selector: 'messaging-message-form',
  templateUrl: './message-form.html',
  styleUrl: './message-form.scss',
  imports: [
    Selector,
    TranslatePipe,
    ReactiveFormsModule,
    TextAreaInputComponent,
    AsyncSelectSearch,
  ],
  providers: [ConfigurationsOptionsService, GroupsOptionsService],
})
export class MessageForm extends BaseComponent implements OnInit {
  formGroup: InputSignal<FormGroup<TMessageForm>> = input.required();

  private readonly configurationsOptionsService = inject(ConfigurationsOptionsService);
  private readonly groupsOptionsService = inject(GroupsOptionsService);

  configurationsOptions = this.configurationsOptionsService.configurationsOptions;
  groupsOptions = this.groupsOptionsService.groupsOptions;
  deviceAutocompleteService = new DevicesNamesAutocompleteService();

  scopeOptions = SCOPE_OPTIONS;

  get scope(): string {
    return this.formGroup().controls.scope.value;
  }

  ngOnInit(): void {
    this.formGroup()
      .controls.scope.valueChanges.pipe(this.untilDestroyed())
      .subscribe(() => {
        this.updateFormControls();
      });

    this.updateFormControls();
  }

  private updateFormControls(): void {
    this.formGroup().controls.deviceNumber.reset();
    this.formGroup().controls.configurationId.reset();
    this.formGroup().controls.groupId.reset();

    if (this.scope === 'configuration') {
      this.formGroup().controls.configurationId.enable();
      this.formGroup().controls.groupId.disable();
      this.formGroup().controls.deviceNumber.disable();
    } else if (this.scope === 'group') {
      this.formGroup().controls.groupId.enable();
      this.formGroup().controls.configurationId.disable();
      this.formGroup().controls.deviceNumber.disable();
    } else if (this.scope === 'device') {
      this.formGroup().controls.deviceNumber.enable();
      this.formGroup().controls.configurationId.disable();
      this.formGroup().controls.groupId.disable();
    } else {
      this.formGroup().controls.configurationId.disable();
      this.formGroup().controls.groupId.disable();
      this.formGroup().controls.deviceNumber.disable();
    }
  }
}
