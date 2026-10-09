import { TOption } from 'hmdm-ui-kit';

export const TIME_ZONE_MODE = {
  DEFAULT: 'default',
  AUTO: 'auto',
  MANUAL: 'manual',
} as const;

export const AUTO_TIME_ZONE = TIME_ZONE_MODE.AUTO;

export const MANAGE_TIMEZONE_OPTIONS: TOption<string>[] = [
  {
    value: TIME_ZONE_MODE.DEFAULT,
    viewValue: 'form.configuration.settings.common.timezone.mode.default',
  },
  {
    value: TIME_ZONE_MODE.AUTO,
    viewValue: 'form.configuration.settings.common.timezone.mode.auto',
  },
  {
    value: TIME_ZONE_MODE.MANUAL,
    viewValue: 'form.configuration.settings.common.timezone.mode.manual',
  },
];
