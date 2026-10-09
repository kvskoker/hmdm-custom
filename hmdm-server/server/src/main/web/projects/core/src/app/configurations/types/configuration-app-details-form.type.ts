import { TToFormGroup } from 'hmdm-ui-kit';

export type TConfigurationAppDetailsFormValue = {
  keyCode: string;
  bottom: boolean;
  longTap: boolean;
};

export type TConfigurationAppDetailsForm = TToFormGroup<TConfigurationAppDetailsFormValue>;
