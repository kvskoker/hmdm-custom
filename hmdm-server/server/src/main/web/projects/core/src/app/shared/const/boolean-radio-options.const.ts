import { TOption } from 'hmdm-ui-kit';

export const BOOLEAN_RADIO_OPTIONS: TOption<boolean | null>[] = [
  { value: null, viewValue: 'form.configuration.settings.common.gps.any' },
  { value: false, viewValue: 'form.configuration.settings.common.gps.off' },
  { value: true, viewValue: 'form.configuration.settings.common.gps.on' },
];
