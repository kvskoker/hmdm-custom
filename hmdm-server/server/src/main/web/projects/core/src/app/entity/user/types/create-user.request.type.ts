export type TCreateUserRequest = {
  allConfigAvailable: boolean;
  allDevicesAvailable: boolean;
  configurations: { id: number }[];
  confirm: string;
  confirmModal: string;
  email: string;
  groups: { id: number }[];
  login: string;
  name: string;
  newPassword: string;
  userRole: { id: number };
  alertLevel: number;
};
