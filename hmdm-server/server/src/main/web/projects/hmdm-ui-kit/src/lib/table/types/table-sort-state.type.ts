import { TSortDirection } from './sort-direction.type';

export type TTableSortState = {
  sortBy: string;
  sortDir: TSortDirection | null;
};
