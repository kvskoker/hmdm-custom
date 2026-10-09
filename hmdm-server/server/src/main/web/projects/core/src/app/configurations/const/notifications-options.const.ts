import { TOption } from 'hmdm-ui-kit';

export const NOTIFICATIONS_OPTIONS: TOption<string>[] = [
  {
    value: 'mqttAlarm',
    viewValue: 'form.configuration.settings.push.options.mqtt.alarm',
  },
  {
    value: 'polling',
    viewValue: 'form.configuration.settings.push.options.polling',
  },
];
