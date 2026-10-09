import { TOption } from 'hmdm-ui-kit';

export const DEFAULT_ALERT_LEVEL = 20;

export const ALERT_LEVEL_OPTIONS: TOption<number>[] = [
  { value: 10, viewValue: 'form.user.alert.level.info' },
  { value: 20, viewValue: 'form.user.alert.level.warning' },
  { value: 30, viewValue: 'form.user.alert.level.severe' },
  { value: 40, viewValue: 'form.user.alert.level.none' },
];
