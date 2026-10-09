import { TOption } from 'hmdm-ui-kit';

export const PERMISSIONS_OPTIONS: TOption<string>[] = [
  { value: 'GRANTALL', viewValue: 'form.configuration.settings.apps.permissions.grant' },
  { value: 'ASKLOCATION', viewValue: 'form.configuration.settings.apps.permissions.ask.location' },
  {
    value: 'DENYLOCATION',
    viewValue: 'form.configuration.settings.apps.permissions.deny.location',
  },
  { value: 'ASKALL', viewValue: 'form.configuration.settings.apps.permissions.ask.all' },
];
