import { TStatusColor } from './status-color.type';

export type TStatus = {
  color: TStatusColor;
  label?: string;
  tooltip?: string;
};
