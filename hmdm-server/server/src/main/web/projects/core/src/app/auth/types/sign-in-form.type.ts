import { FormControl } from '@angular/forms';

export type TSignInForm = {
  login: FormControl<string>;
  password: FormControl<string>;
};
