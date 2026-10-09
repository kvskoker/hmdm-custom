import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-slider',
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    HelpTooltip,
  ],
})
export class Slider extends BaseControlValueAccessor<number> {
  min: InputSignal<number> = input<number>(0);
  max: InputSignal<number> = input<number>(100);
  step: InputSignal<number> = input<number>(1);
  showThumbLabel: InputSignal<boolean> = input<boolean>(true);
  inline: InputSignal<boolean> = input<boolean>(false);
}
