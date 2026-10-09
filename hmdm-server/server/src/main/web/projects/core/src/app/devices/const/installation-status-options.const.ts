import { TOption } from 'hmdm-ui-kit';

export const INSTALLATION_STATUS_OPTIONS: TOption<string>[] = [
  {
    viewValue: 'Success',
    value: 'success',
  },
  {
    viewValue: 'Version mismatch',
    value: 'version_mismatch',
  },
  {
    viewValue: 'Failure',
    value: 'failure',
  },
];
