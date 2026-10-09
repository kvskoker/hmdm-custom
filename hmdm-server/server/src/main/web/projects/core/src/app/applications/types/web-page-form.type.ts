import { TToFormGroup } from 'hmdm-ui-kit';

export type TWebPageFormValue = {
  name: string;
  url: string;
  useKiosk: boolean;
};

export type TWebPageForm = TToFormGroup<TWebPageFormValue>;
