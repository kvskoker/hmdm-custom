import { TToFormGroup } from 'hmdm-ui-kit';

export type TUserFormValue = {
  login: string;
  email: string;
  name: string;
  allConfigAvailable: boolean;
  allDevicesAvailable: boolean;
  newPassword: string;
  confirm: string;
  configurations: number[];
  groups: number[];
  userRole: number | null;
  alertLevel: number;
};

export type TUserForm = TToFormGroup<TUserFormValue>;
