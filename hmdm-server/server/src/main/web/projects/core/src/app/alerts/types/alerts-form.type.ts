import { TToFormGroup } from 'hmdm-ui-kit';

export type TAlertsFormValue = {
  deviceFilter: number | null;
  date: DateRange | null;
  severity: number;
};

type DateRange = {
  start: Date;
  end: Date;
}

export type TAlertsForm = TToFormGroup<TAlertsFormValue>;
