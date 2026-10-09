export type TOptional<T> = {
  [K in keyof T]?: T[K] | null;
};
