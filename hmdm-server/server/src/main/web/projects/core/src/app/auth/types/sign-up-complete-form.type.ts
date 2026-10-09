import { TToFormGroup } from 'hmdm-ui-kit';

export type TSignUpCompleteFormValue = {
  customerId: string;
  firstName: string;
  lastName: string;
  company: string;
  description: string;
  newPassword: string;
  confirm: string;
};

export type TSignUpCompleteForm = TToFormGroup<TSignUpCompleteFormValue>;
