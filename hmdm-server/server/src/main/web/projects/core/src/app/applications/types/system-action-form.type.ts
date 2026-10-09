import { TToFormGroup } from 'hmdm-ui-kit';

export type TSystemActionFormValue = {
  name: string;
  intent: string;
};

export type TSystemActionForm = TToFormGroup<TSystemActionFormValue>;
