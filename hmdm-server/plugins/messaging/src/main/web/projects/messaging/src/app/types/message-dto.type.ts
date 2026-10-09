export type TMessageDTO = {
  id: number;
  customerId: number;
  deviceId: number;
  deviceNumber: string;
  ts: number;
  message: string;
  status: number;
  common: boolean;
};
