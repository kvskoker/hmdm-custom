import { TOption } from 'hmdm-ui-kit';

export const STATUS_OPTIONS: TOption<number>[] = [];
STATUS_OPTIONS.push(
  { value: -1, viewValue: 'plugin.messaging.option.status.all' },
  { value: 0, viewValue: 'plugin.messaging.option.status.sent' },
  { value: 1, viewValue: 'plugin.messaging.option.status.delivered' },
  { value: 2, viewValue: 'plugin.messaging.option.status.read' },
);
