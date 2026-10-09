import { TToFormGroup } from 'hmdm-ui-kit';

export type TTaskFormValue = {
  comment: string;
  configurationId: number | null;
  customMessageType: string;
  day: string;
  deviceNumber: string | null;
  groupId: number | null;
  hour: string;
  messageType: string;
  min: string;
  month: string;
  payload: string;
  scope: string;
  weekday: string;
};

export type TTaskForm = TToFormGroup<TTaskFormValue>;
