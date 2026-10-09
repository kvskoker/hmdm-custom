import { TOption } from 'hmdm-ui-kit';

export const KEEPALIVE_OPTIONS: TOption<number>[] = [
  { value: 60, viewValue: 'form.configuration.settings.minute.1' },
  { value: 120, viewValue: 'form.configuration.settings.minutes.2' },
  { value: 180, viewValue: 'form.configuration.settings.minutes.3' },
  { value: 300, viewValue: 'form.configuration.settings.minutes.5' },
  { value: 600, viewValue: 'form.configuration.settings.minutes.10' },
  { value: 900, viewValue: 'form.configuration.settings.minutes.15' },
];
