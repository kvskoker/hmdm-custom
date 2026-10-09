import { TOption } from 'hmdm-ui-kit';
import { TApplicationArchitecture } from '../../entity/application/types/application-architecture.type';

export const APPLICATION_ARCHITECTURE_OPTIONS: TOption<TApplicationArchitecture>[] = [
  { value: 'none', viewValue: 'form.application.arch.universal' },
  { value: 'armeabi', viewValue: 'form.application.arch.armeabi' },
  { value: 'arm64', viewValue: 'form.application.arch.arm64' },
];
