import { TOption } from 'hmdm-ui-kit';

export const WIFI_SECURITY_OPTIONS: TOption<string>[] = [
  { value: 'WPA', viewValue: 'WPA' },
  { value: 'WEP', viewValue: 'WEP' },
  { value: 'EAP', viewValue: 'EAP' },
  { value: 'NONE', viewValue: 'NONE' },
];
