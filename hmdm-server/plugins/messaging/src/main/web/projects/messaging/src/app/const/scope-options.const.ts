import { TOption } from 'hmdm-ui-kit';

export const SCOPE_OPTIONS: TOption<string>[] = [
  { value: 'device', viewValue: 'plugin.messaging.scope.device' },
  { value: 'group', viewValue: 'plugin.messaging.scope.group' },
  { value: 'configuration', viewValue: 'plugin.messaging.scope.configuration' },
  { value: 'all', viewValue: 'plugin.messaging.scope.all' },
];
