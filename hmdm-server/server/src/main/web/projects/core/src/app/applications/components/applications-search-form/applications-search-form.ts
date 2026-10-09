import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Checkbox,
  MatButtonModule,
  MatIconModule,
  TranslatePipe,
  PersistFormDirective,
} from 'hmdm-ui-kit';

@Component({
  selector: 'core-applications-search-form',
  templateUrl: './applications-search-form.html',
  styleUrl: './applications-search-form.scss',
  imports: [
    Checkbox,
    TranslatePipe,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    PersistFormDirective,
  ],
})
export class ApplicationsSearchForm {
  formGroup: InputSignal<FormGroup> = input.required();
}
