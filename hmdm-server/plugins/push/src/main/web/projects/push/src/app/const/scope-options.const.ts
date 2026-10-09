import { TOption } from 'hmdm-ui-kit';

export const SCOPE_OPTIONS: TOption<string>[] = [
  { value: 'device', viewValue: 'plugin.push.scope.device' },
  { value: 'group', viewValue: 'plugin.push.scope.group' },
  { value: 'configuration', viewValue: 'plugin.push.scope.configuration' },
  { value: 'all', viewValue: 'plugin.push.scope.all' },
];
