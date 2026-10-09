import { FormControl } from '@angular/forms';

export type TToFormGroup<T> = {
  [K in keyof T]: FormControl<T[K]>;
};
