import { THttpPageableRequest } from 'hmdm-ui-kit';

export type TSearchTasksRequest = THttpPageableRequest & {
  messageFilter: string;
  sortValue: string;
};
