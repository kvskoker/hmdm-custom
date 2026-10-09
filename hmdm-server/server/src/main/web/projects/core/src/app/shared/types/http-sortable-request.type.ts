import { TSortDirection } from 'hmdm-ui-kit';

export type THttpSortableRequest = {
  sortBy: string | null;
  sortDir: TSortDirection;
};
