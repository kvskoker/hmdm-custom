export type TAlertDTO = {
  customerId: number,
  createTime: number,
  common: boolean,
  id: number,
  deviceId: number | null,
  deviceNumber: number | null,
  level: number,
  message: string
}

export type TAlertResponse = {
  items: TAlertDTO[];
  totalItemsCount: number;
}
