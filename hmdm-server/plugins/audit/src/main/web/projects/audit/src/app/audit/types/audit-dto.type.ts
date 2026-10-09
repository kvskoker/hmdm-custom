export type TAuditDTO = {
  id: number;
  customerId: number;
  userId: number;
  createTime: number;
  login: string;
  action: string;
  payload: string;
  ipAddress: string;
  errorCode: number;
  common: boolean;
};
