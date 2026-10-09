import { TToFormGroup } from 'hmdm-ui-kit';

export type TSearchMessagesFormValue = {
  dateRange: any;
  deviceFilter: string;
  status: number;
};

export type TSearchMessagesForm = TToFormGroup<TSearchMessagesFormValue>;
