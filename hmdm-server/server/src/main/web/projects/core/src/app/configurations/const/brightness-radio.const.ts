import { TOption } from 'hmdm-ui-kit';

export const BRIGHTNESS_RADIO_OPTIONS: TOption<boolean | null>[] = [
  { value: null, viewValue: 'form.configuration.settings.common.brightness.none' },
  { value: false, viewValue: 'form.configuration.settings.common.brightness.manual' },
  { value: true, viewValue: 'form.configuration.settings.common.brightness.auto' },
];
