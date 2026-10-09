import { TOption } from 'hmdm-ui-kit';

export const SEVERITY_OPTIONS: TOption<number>[] = [
  { value: -1, viewValue: 'ALL' },
  { value: 0, viewValue: 'NONE' },
  { value: 1, viewValue: 'ERROR' },
  { value: 2, viewValue: 'WARNING' },
  { value: 3, viewValue: 'INFO' },
  { value: 4, viewValue: 'DEBUG' },
  { value: 5, viewValue: 'VERBOSE' },
];
