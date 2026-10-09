export type TAlertBodyDTO = {
  messageFilter: string;
  pageSize: number | null;
  pageNum: number | null;
  deviceFilter: number | null;
  dateFrom: number | null;
  dateTo: number | null;
  severity: number | null;
  sortValue: 'createTime' | 'deviceNumber';
  export: boolean;
}
