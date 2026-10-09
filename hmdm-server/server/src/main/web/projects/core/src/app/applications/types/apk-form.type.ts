import { TToFormGroup } from 'hmdm-ui-kit';

export type TApkFormValue = {
  arch: string;
  name: string;
  pkg: string;
  runAfterInstall: boolean;
  runAtBoot: boolean;
  system: boolean;
  url: string;
  version: string;
  file: File | null;
  versionCode?: number;
  versionExists?: boolean;
};

export type TApkForm = TToFormGroup<Omit<TApkFormValue, 'versionCode' | 'versionExists'>>;
