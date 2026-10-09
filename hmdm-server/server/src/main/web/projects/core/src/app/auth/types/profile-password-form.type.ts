import { TToFormGroup } from 'hmdm-ui-kit';

export type TProfilePasswordFormValue = {
  oldPassword: string;
  newPassword: string;
  confirm: string;
};

export type TProfilePasswordForm = TToFormGroup<TProfilePasswordFormValue>;
