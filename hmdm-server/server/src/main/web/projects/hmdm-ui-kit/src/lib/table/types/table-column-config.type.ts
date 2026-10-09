import { Type } from '@angular/core';

export type TTableColumnConfig = {
  columnDef: string;
  label: string;
  cellComponent?: Type<any>;
};
