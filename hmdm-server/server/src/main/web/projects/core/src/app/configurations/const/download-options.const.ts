import { TOption } from 'hmdm-ui-kit';

export const DOWNLOAD_OPTIONS: TOption<string>[] = [
  { value: 'UNLIMITED', viewValue: 'form.configuration.settings.download.updates.unlimited' },
  { value: 'LIMITED', viewValue: 'form.configuration.settings.download.updates.limited' },
  { value: 'WIFI', viewValue: 'form.configuration.settings.download.updates.wifi' },
];
