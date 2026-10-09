import { TToFormGroup } from 'hmdm-ui-kit';

export type TSignUpFormValue = {
  email: string;
};

export type TSignUpForm = TToFormGroup<TSignUpFormValue>;
