import { TOption } from 'hmdm-ui-kit';

export const LOGOUT_OPTIONS: TOption<number>[] = [
  { value: 0, viewValue: 'form.settings.misc.idle.logout.never' },
  { value: 300, viewValue: 'form.settings.misc.idle.logout.1' },
  { value: 600, viewValue: 'form.settings.misc.idle.logout.2' },
  { value: 1800, viewValue: 'form.settings.misc.idle.logout.3' },
  { value: 3600, viewValue: 'form.settings.misc.idle.logout.4' },
];
