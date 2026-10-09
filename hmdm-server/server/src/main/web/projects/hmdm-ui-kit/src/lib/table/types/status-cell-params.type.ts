import { TStatus } from './status.type';

export type TStatusCellParams<T> = {
  status: (data: T) => TStatus;
};
