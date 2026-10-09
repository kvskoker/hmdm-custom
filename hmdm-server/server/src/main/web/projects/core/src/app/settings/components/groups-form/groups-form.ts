import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { TGroupForm } from '../../types/group-form.type';

@Component({
  selector: 'core-groups-form',
  templateUrl: './groups-form.html',
  styleUrl: './groups-form.scss',
  imports: [ReactiveFormsModule, TextInputComponent, TranslatePipe],
})
export class GroupsForm {
  formGroup: InputSignal<FormGroup<TGroupForm>> = input.required();
}
