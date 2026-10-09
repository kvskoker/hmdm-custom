import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { ColorPickerDirective } from 'ngx-color-picker';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['../controls-style.scss', './color-input.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInputModule,
    MatIconButton,
    ColorPickerDirective,
    ErrorMessage,
    HelpTooltip,
  ],
})
export class ColorInputComponent extends BaseControlValueAccessor<string> {
  onColorChange(color: string): void {
    this.formControl.setValue(color);
  }
}
