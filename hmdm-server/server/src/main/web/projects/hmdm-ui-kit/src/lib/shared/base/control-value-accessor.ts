import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  InputSignal,
  signal,
  WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { BaseComponent } from './component';

@Component({
  selector: 'hmdm-base-control-value-accessor',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseControlValueAccessor),
      multi: true,
    },
  ],
})
export abstract class BaseControlValueAccessor<T>
  extends BaseComponent
  implements ControlValueAccessor
{
  protected isFirstWrite: boolean = true;

  label: InputSignal<string> = input<string>('');
  showLabel: InputSignal<boolean> = input<boolean>(true);
  showError: InputSignal<boolean> = input<boolean>(true);
  help: InputSignal<string> = input<string>('');

  control = inject(NgControl, { optional: true, self: true });
  protected cdr = inject(ChangeDetectorRef);

  formControl = new FormControl<T | null>(null);
  isTouched: boolean = false;
  isDisabled: WritableSignal<boolean> = signal(false);

  constructor() {
    super();

    if (this.control) {
      this.control.valueAccessor = this;
    }

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.onChange(this.formControl.value);
      this.onTouched();
    });
  }

  writeValue(value: T): void {
    this.formControl.setValue(value, { emitEvent: false });
    this.formControl.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();

    if (value && this.isFirstWrite) {
      this.isFirstWrite = false;

      setTimeout(() => {
        this.formControl.markAsTouched();
        this.cdr.markForCheck();
      });
    }
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.onDisabled(isDisabled);
  }

  protected onTouched(): void {
    this.formControl.markAsTouched();
    this.control?.control?.markAsTouched();
    this.isTouched = true;
  }

  protected onDisabled(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    isDisabled
      ? this.formControl.disable({ emitEvent: false })
      : this.formControl.enable({ emitEvent: false });
  }

  private onChange: (value: T | null) => void = () => {};
}
