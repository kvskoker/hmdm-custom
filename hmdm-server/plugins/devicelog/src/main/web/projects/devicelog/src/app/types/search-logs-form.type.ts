import { TToFormGroup } from 'hmdm-ui-kit';

export type TSearchLogsFormValue = {
  dateRange: any;
  deviceFilter: string;
  applicationFilter: string;
  severity: number;
};

export type TSearchLogsForm = TToFormGroup<TSearchLogsFormValue>;
