import { TColumnConfig } from './column-config.type';
import { TTablePaginatorConfig } from './table-paginator-config.type';

export type TTableConfig<T = any> = {
  columns: TColumnConfig[];
  paginator?: TTablePaginatorConfig;
  selector?: boolean;
  trackBy?: keyof T | ((index: number, item: T) => any);
};
