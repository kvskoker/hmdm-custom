import { TOption } from 'hmdm-ui-kit';

export const INTERVAL_OPTIONS: TOption<number>[] = [
  { value: 3600, viewValue: 'plugin.deviceinfo.dynamic.period.1' },
  { value: 6 * 3600, viewValue: 'plugin.deviceinfo.dynamic.period.6' },
  { value: 24 * 3600, viewValue: 'plugin.deviceinfo.dynamic.period.24' },
  { value: 48 * 3600, viewValue: 'plugin.deviceinfo.dynamic.period.48' },
  { value: -1, viewValue: 'plugin.deviceinfo.dynamic.period.any' },
];
