import { Component, input, InputSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DateRange,
  PersistFormDirective,
  Selector,
  TOption,
  TranslatePipe,
  PersistControlDirective,
} from 'hmdm-ui-kit';
import { AUDIT_ACTION_OPTIONS } from '../../const/audit-action-options.const';
import { TAuditForm } from '../../types/audit-form.type';

@Component({
  selector: 'audit-form',
  templateUrl: './audit-form.html',
  styleUrl: './audit-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    DateRange,
    TranslatePipe,
    PersistFormDirective,
    PersistControlDirective,
  ],
})
export class AuditForm {
  formGroup: InputSignal<FormGroup<TAuditForm>> = input.required();
  readonly auditActionOptions: TOption<string>[] = AUDIT_ACTION_OPTIONS;
}
