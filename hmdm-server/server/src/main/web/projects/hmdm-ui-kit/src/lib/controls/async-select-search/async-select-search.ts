import {
  Component,
  input,
  InputSignal,
  OnInit,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, takeUntil, tap } from 'rxjs';
import { BaseControlValueAccessor, ClickOutsideDirective, TOption } from '../../../public-api';
import { BaseAutocompleteService } from '../../shared/base/base-autocomplete.service';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-async-select-search',
  templateUrl: './async-select-search.html',
  styleUrls: ['../controls-style.scss', './async-select-search.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    ErrorMessage,
    MatInputModule,
    ClickOutsideDirective,
    HelpTooltip,
  ],
})
export class AsyncSelectSearch<R = unknown>
  extends BaseControlValueAccessor<unknown>
  implements OnInit
{
  autocompleteServiceProps: InputSignal<BaseAutocompleteService<R>> = input.required();
  autocompleteService: BaseAutocompleteService<R> | null = null;

  options: Signal<TOption<unknown>[]> = signal([]);
  searchControl: FormControl<TOption<unknown> | string> = new FormControl('', {
    nonNullable: true,
  });

  ngOnInit(): void {
    this.autocompleteService = this.autocompleteServiceProps();
    this.options = this.autocompleteService.options;

    this.searchControl.valueChanges
      .pipe(
        tap((option: TOption<unknown> | string) => {
          if (typeof option !== 'string') {
            this.searchControl.setValue(option.viewValue, { emitEvent: false });
            this.formControl.setValue(option.value);
          }
        }),
        debounceTime(300),
        takeUntil(this.$destroyRef),
      )
      .subscribe((option) => {
        if (!option) {
          this.formControl.setValue(null);
          return;
        }

        if (typeof option === 'string') {
          this.autocompleteService?.search(option);
        }
      });
  }

  override writeValue(value: string): void {
    super.writeValue(value);

    if (value) {
      this.searchControl.setValue(value, { emitEvent: false });

      if (typeof value === 'string') {
        this.autocompleteService?.search(value);
      }
    } else {
      this.searchControl.setValue('', { emitEvent: false });
    }
  }
}
