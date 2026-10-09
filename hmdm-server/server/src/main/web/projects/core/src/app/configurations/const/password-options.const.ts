import { TOption } from 'hmdm-ui-kit';

export const PASSWORD_OPTIONS: TOption<string>[] = [
  { value: 'any', viewValue: 'form.configuration.settings.password.mode.any' },
  { value: 'present', viewValue: 'form.configuration.settings.password.mode.present' },
  { value: 'easy', viewValue: 'form.configuration.settings.password.mode.easy' },
  { value: 'moderate', viewValue: 'form.configuration.settings.password.mode.moderate' },
  { value: 'strong', viewValue: 'form.configuration.settings.password.mode.strong' },
];
