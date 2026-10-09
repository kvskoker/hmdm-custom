import { TToFormGroup } from 'hmdm-ui-kit';

export type TMessageFormValue = {
  configurationId: number | null;
  customMessageType: string;
  deviceNumber: string | null;
  groupId: number | null;
  messageType: string;
  payload: string;
  scope: string;
};

export type TMessageForm = TToFormGroup<TMessageFormValue>;
