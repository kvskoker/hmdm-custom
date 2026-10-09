import { TToFormGroup } from 'hmdm-ui-kit';

export type TSettingsFormValue = {
  intervalMins: number;
  dataPreservePeriod: number;
  sendData: boolean;
};

export type TSettingsForm = TToFormGroup<TSettingsFormValue>;
