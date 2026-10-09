import { TToFormGroup } from 'hmdm-ui-kit';

export type TEditVersionFormValue = {
  version: string;
  split: boolean;
  url: string | null;
  urlArmeabi: string | null;
  urlArm64: string | null;
};

export type TEditVersionForm = TToFormGroup<TEditVersionFormValue>;
