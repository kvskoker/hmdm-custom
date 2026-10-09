import { THttpPageableRequest } from 'hmdm-ui-kit';

export type TSearchMessageRequest = THttpPageableRequest & {
  dateFrom: string | null;
  dateTo: string | null;
  deviceFilter: string;
  messageFilter: string;
  sortValue: string;
};
