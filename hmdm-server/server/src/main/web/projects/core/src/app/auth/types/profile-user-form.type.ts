import { TToFormGroup } from 'hmdm-ui-kit';

export type TProfileUserFormValue = {
  login: string;
  name: string;
  email: string;
  alertLevel: number;
};

export type TProfileUserForm = TToFormGroup<TProfileUserFormValue>;
