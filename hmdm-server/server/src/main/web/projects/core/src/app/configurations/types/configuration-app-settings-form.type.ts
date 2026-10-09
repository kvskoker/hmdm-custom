import { TToFormGroup } from 'hmdm-ui-kit';

export type TConfigurationAppSettingsFormValue = {
  applicationId: number | null;
  name: string;
  value: string;
  variable: boolean;
  comment: string;
};

export type TConfigurationAppSettingsForm = TToFormGroup<TConfigurationAppSettingsFormValue>;
