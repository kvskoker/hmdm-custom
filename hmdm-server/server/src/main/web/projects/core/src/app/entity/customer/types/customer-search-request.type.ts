export type TCustomerSearchRequest = {
  currentPage: number;
  pageSize: number;
  searchValue?: string;
  accountType?: number;
  customerStatus?: string;
  sortValue?: string;
  sortDirection?: 'asc' | 'desc';
};
