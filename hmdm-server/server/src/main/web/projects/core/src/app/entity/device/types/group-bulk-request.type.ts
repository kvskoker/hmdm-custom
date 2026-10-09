export type TGroupBulkRequest = {
  ids: number[];
  groups: { id: number }[];
  action: 'set' | 'remove';
};
