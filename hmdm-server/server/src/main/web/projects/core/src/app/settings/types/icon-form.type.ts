import { TToFormGroup } from 'hmdm-ui-kit';

export type TIconFormValue = {
  name: string;
  fileId: number | null;
};

export type TIconForm = TToFormGroup<TIconFormValue>;
