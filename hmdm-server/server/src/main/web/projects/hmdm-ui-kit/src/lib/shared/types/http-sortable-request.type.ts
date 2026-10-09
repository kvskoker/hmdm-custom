import { TSortDirection } from '../../table/types/sort-direction.type';

export type THttpSortableRequest = {
  sortBy: string | null;
  sortDir: TSortDirection;
};
