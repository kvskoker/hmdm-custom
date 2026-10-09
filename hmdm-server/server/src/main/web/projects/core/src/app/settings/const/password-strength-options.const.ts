import { TOption } from 'hmdm-ui-kit';

export const PASSWORD_STRENGTH_OPTIONS: TOption<number>[] = [
  { value: 0, viewValue: 'form.settings.misc.password.none' },
  { value: 1, viewValue: 'form.settings.misc.password.alphanumeric' },
  { value: 2, viewValue: 'form.settings.misc.password.specialchar' },
];
