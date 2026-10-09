import { FormControl } from '@angular/forms';

export type TCustomerForm = {
  name: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  language: FormControl<string>;
  email: FormControl<string>;
  description: FormControl<string>;
  accountType: FormControl<number | null>;
  customerStatus: FormControl<string | null>;
  expiryTime: FormControl<Date | null>;
  deviceLimit: FormControl<number | null>;
  sizeLimit: FormControl<number | null>;
  prefix: FormControl<string>;
  deviceConfigurationId: FormControl<number | null>;
  configurationIds: FormControl<number[]>;
  copyDesign: FormControl<boolean>;
};
