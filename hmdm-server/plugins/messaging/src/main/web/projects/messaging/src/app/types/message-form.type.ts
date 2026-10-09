import { TToFormGroup } from 'hmdm-ui-kit';

export type TMessageFormValue = {
  scope: string;
  deviceNumber: string | null;
  groupId: number | null;
  configurationId: number | null;
  message: string;
};

export type TMessageForm = TToFormGroup<TMessageFormValue>;
