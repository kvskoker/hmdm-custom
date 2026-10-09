import { TToFormGroup } from 'hmdm-ui-kit';

export type TSearchMessagesFormValue = {
  dateRange: any;
  deviceFilter: string;
};

export type TSearchMessagesForm = TToFormGroup<TSearchMessagesFormValue>;
