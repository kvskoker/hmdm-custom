import { TPermissionDTO } from './permission-dto.type';

export type TUserDTO = {
  id: number;
  login: string;
  email: string;
  name: string;
  customerId: number;
  userRole: {
    id: number;
    name: string;
    description: string | null;
    superAdmin: boolean;
    permissions: TPermissionDTO[];
  };
  allDevicesAvailable: boolean;
  allConfigAvailable: boolean;
  passwordReset: boolean;
  passwordResetToken?: string;
  authToken: string;
  twoFactorAccepted: boolean;
  twoFactor: boolean;
  lastLoginFail: number;
  groups: { id: number; name: string }[];
  configurations: { id: number; name: string }[];
  masterCustomer: boolean;
  editable: boolean;
  singleCustomer: boolean;
  superAdmin: boolean;
  common: boolean;
  alertLevel: number;
};
