export type THttpPageableResponse<T> = {
  data: {
    items: T[];
    totalItemsCount: number;
  };
  message: string | null;
  status: string;
};
