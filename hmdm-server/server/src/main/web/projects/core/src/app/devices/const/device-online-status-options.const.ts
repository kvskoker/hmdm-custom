import { TOption } from 'hmdm-ui-kit';

export const DEVICE_ONLINE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

export const DEVICE_ONLINE_STATUS_OPTIONS: TOption<string>[] = [
  {
    viewValue: 'form.devices.selection.online',
    value: DEVICE_ONLINE_STATUS.ONLINE,
  },
  {
    viewValue: 'form.devices.selection.offline',
    value: DEVICE_ONLINE_STATUS.OFFLINE,
  },
];
