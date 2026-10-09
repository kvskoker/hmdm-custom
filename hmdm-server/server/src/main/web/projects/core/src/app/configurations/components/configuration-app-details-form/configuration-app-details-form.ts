import { Component, input, InputSignal, OnInit, output, OutputEmitterRef } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent, Checkbox, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import {
  TConfigurationAppDetailsForm,
  TConfigurationAppDetailsFormValue,
} from '../../types/configuration-app-details-form.type';

@Component({
  selector: 'core-configuration-app-details-form',
  templateUrl: './configuration-app-details-form.html',
  styleUrl: './configuration-app-details-form.scss',
  imports: [ReactiveFormsModule, Checkbox, TextInputComponent, TranslatePipe],
})
export class ConfigurationAppDetailsForm extends BaseComponent implements OnInit {
  formChange: OutputEmitterRef<TConfigurationAppDetailsFormValue> = output();

  formGroup: InputSignal<FormGroup<TConfigurationAppDetailsForm>> = input.required();

  ngOnInit(): void {
    this.formGroup()
      .valueChanges.pipe(this.untilDestroyed())
      .subscribe(() => {
        const value = this.formGroup().getRawValue();
        this.formChange.emit(value);
      });
  }
}
