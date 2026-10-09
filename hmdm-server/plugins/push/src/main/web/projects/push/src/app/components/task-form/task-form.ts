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
  TextInputComponent,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { CUSTOM_MESSAGE_TYPE, MESSAGE_TYPE_OPTIONS } from '../../const/message-type-options.const';
import { MESSAGE_TYPE_PAYLOADS } from '../../const/message-type-payloads.const';
import { SCOPE_OPTIONS } from '../../const/scope-options.const';
import { TTaskForm } from '../../types/task-form.type';

@Component({
  selector: 'push-task-form',
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    AsyncSelectSearch,
    TranslatePipe,
    TextAreaInputComponent,
    TextInputComponent,
  ],
})
export class TaskForm extends BaseComponent implements OnInit {
  formGroup: InputSignal<FormGroup<TTaskForm>> = input.required();

  private readonly configurationsOptionsService = inject(ConfigurationsOptionsService);
  private readonly groupsOptionsService = inject(GroupsOptionsService);

  configurationsOptions = this.configurationsOptionsService.configurationsOptions;
  groupsOptions = this.groupsOptionsService.groupsOptions;
  deviceAutocompleteService = new DevicesNamesAutocompleteService();

  scopeOptions = SCOPE_OPTIONS;
  messageTypeOptions = MESSAGE_TYPE_OPTIONS;

  get scope(): string {
    return this.formGroup().controls.scope.value;
  }

  get messageType(): string {
    return this.formGroup().controls.messageType.value;
  }

  get isCustomMessageType(): boolean {
    return this.messageType === CUSTOM_MESSAGE_TYPE;
  }

  ngOnInit(): void {
    this.formGroup()
      .controls.scope.valueChanges.pipe(this.untilDestroyed())
      .subscribe(() => {
        this.formGroup().controls.deviceNumber.reset();
        this.formGroup().controls.configurationId.reset();
        this.formGroup().controls.groupId.reset();
        this.updateFormControls();
      });

    this.formGroup()
      .controls.messageType.valueChanges.pipe(this.untilDestroyed())
      .subscribe((messageType) => {
        this.updateCustomMessageType();
        this.formGroup().controls.payload.setValue(MESSAGE_TYPE_PAYLOADS[messageType] ?? '');
      });

    this.updateFormControls();
  }

  private updateFormControls(): void {
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

    this.updateCustomMessageType();
  }

  private updateCustomMessageType(): void {
    if (this.isCustomMessageType) {
      this.formGroup().controls.customMessageType.enable();
    } else {
      this.formGroup().controls.customMessageType.disable();
      this.formGroup().controls.customMessageType.reset();
    }
  }
}
