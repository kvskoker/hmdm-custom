import { TOption } from 'hmdm-ui-kit';

export const UPDATE_RADIO_OPTIONS: TOption<number>[] = [
  { value: 0, viewValue: 'form.configuration.settings.system.update.default' },
  { value: 1, viewValue: 'form.configuration.settings.system.update.immediate' },
  { value: 2, viewValue: 'form.configuration.settings.system.update.scheduled' },
  { value: 3, viewValue: 'form.configuration.settings.system.update.postponed' },
];
