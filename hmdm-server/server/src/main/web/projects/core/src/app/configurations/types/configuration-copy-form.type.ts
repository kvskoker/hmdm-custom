import { TToFormGroup } from 'hmdm-ui-kit';

export type TConfigurationCopyFormValue = {
  name: string;
  description: string;
};

export type TConfigurationCopyForm = TToFormGroup<TConfigurationCopyFormValue>;
