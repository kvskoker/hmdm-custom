import { ChangeDetectionStrategy, Component, input, InputSignal, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { TOption } from '../../shared/types/option.type';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-radio',
  templateUrl: './radio.html',
  styleUrl: './radio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    TranslatePipe,
    MatButtonToggleModule,
    HelpTooltip,
  ],
})
export class Radio extends BaseControlValueAccessor<any> {
  options: InputSignal<TOption<any>[]> = input<TOption<any>[]>([]);
}
