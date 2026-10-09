import { THttpPageableRequest } from 'hmdm-ui-kit';

export type TGetAllAuditsRequest = THttpPageableRequest & {
  dateFrom: string | null;
  dateTo: string | null;
  messageFilter: string;
  userFilter: string;
};
