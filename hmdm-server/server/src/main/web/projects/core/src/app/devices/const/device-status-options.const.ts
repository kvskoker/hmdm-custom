import { TOption } from 'hmdm-ui-kit';

export const DEVICE_STATUS_OPTIONS: TOption<string>[] = [
  {
    viewValue: 'form.devices.selection.online',
    value: 'SUCCESS',
  },
  {
    viewValue: 'form.devices.selection.offline',
    value: 'FAILURE',
  },
];
