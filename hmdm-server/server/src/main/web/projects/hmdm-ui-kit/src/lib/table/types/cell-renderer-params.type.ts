export type TCellRendererParams<T = any, P = any> = {
  data: T;
  value: any;
  rowIndex: number;
  provided: P;
};
