import { THttpPageableRequest } from 'hmdm-ui-kit';

export type TDynamicRequest = THttpPageableRequest & {
  dateFrom?: string;
  dateTo?: string;
  deviceNumber: string;
  fixedInterval: number;
  useFixedInterval: boolean;
};
