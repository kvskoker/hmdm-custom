import { TToFormGroup } from 'hmdm-ui-kit';

export type TPasswordResetFormValue = {
  newPassword: string;
  confirm: string;
};

export type TPasswordResetForm = TToFormGroup<TPasswordResetFormValue>;
