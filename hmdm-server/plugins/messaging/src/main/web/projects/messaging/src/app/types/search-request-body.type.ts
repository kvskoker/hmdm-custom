import { THttpPageableRequest } from 'hmdm-ui-kit';

export type TSearchRequestBody = THttpPageableRequest & {
  dateFrom: string | null;
  dateTo: string | null;
  deviceFilter: string;
  messageFilter: string;
  sortValue: string;
  status: number;
};
