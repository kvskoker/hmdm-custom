import { TToFormGroup } from './to-form-group.type';

export type TQrFormValue = {
  deviceId: string | null;
  useId: string | null;
  create: boolean;
  groups: number[] | null;
};

export type TQrForm = TToFormGroup<TQrFormValue>;
