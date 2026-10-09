import { TToFormGroup } from 'hmdm-ui-kit';

export type TSearchFormValue = {
  interval: number;
  dateRange: any;
  timeFrom: Date | null;
  timeTo: Date | null;
};

export type TSearchForm = TToFormGroup<TSearchFormValue>;
