import { TToFormGroup } from 'hmdm-ui-kit';

export type TForgotPasswordFormValue = {
  login: string;
};

export type TForgotPasswordForm = TToFormGroup<TForgotPasswordFormValue>;
