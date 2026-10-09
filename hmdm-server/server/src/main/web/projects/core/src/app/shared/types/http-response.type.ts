export type THttpResponse<T> = {
  data: T;
  message: string | null;
  status: string;
};
