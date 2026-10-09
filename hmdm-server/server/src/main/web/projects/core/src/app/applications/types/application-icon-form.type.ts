import { TToFormGroup } from 'hmdm-ui-kit';

export type TApplicationIconFormValue = {
  showIcon: boolean;
  iconId: number | null;
  iconText: string | null;
};

export type TApplicationIconForm = TToFormGroup<TApplicationIconFormValue>;
