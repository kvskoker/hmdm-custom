import { TToFormGroup } from '../../shared/types/to-form-group.type';

export type TVersionFormValue = {
  version: string;
  arch: string;
  url: string;
  file: File | null;
  autoUpdate: boolean;
};

export type TVersionForm = TToFormGroup<TVersionFormValue>;
