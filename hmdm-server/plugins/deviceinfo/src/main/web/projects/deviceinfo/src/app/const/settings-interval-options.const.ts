import { TOption } from '../../../../../../../../../../server/src/main/web/projects/hmdm-ui-kit/src/public-api';

export const SETTINGS_INTERVAL_OPTIONS: TOption<number>[] = [
  { value: 15, viewValue: 'plugin.deviceinfo.intervalMins.option.1' },
  { value: 30, viewValue: 'plugin.deviceinfo.intervalMins.option.2' },
  { value: 60, viewValue: 'plugin.deviceinfo.intervalMins.option.3' },
  { value: 120, viewValue: 'plugin.deviceinfo.intervalMins.option.4' },
  { value: 360, viewValue: 'plugin.deviceinfo.intervalMins.option.5' },
  { value: 720, viewValue: 'plugin.deviceinfo.intervalMins.option.6' },
  { value: 1440, viewValue: 'plugin.deviceinfo.intervalMins.option.7' },
];
