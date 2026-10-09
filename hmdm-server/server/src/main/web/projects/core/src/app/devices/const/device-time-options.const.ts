import { TOption } from 'hmdm-ui-kit';

export const CUSTOM_TIME_VALUE = 'custom';

export const DEVICE_TIME_OPTIONS: TOption<string>[] = [
  {
    viewValue: 'form.devices.selection.online.status.1',
    value: '15',
  },
  {
    viewValue: 'form.devices.selection.online.status.2',
    value: '30',
  },
  {
    viewValue: 'form.devices.selection.online.status.3',
    value: '60',
  },
  {
    viewValue: 'form.devices.selection.online.status.4',
    value: '120',
  },
  {
    viewValue: 'form.devices.selection.online.status.5',
    value: '360',
  },
  {
    viewValue: 'form.devices.selection.online.status.6',
    value: '1440',
  },
  {
    viewValue: 'form.devices.selection.online.status.7',
    value: '2880',
  },
  {
    viewValue: 'form.devices.selection.online.status.8',
    value: '4320',
  },
  {
    viewValue: 'form.devices.selection.online.status.9',
    value: '10080',
  },
  {
    viewValue: 'form.devices.selection.online.status.10',
    value: '43200',
  },
  {
    viewValue: 'form.devices.selection.online.status.custom',
    value: CUSTOM_TIME_VALUE,
  },
];
