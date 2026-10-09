import { TCreateVersionRequest } from './create-version-request.type';

export type TUpdateVersionRequest = TCreateVersionRequest & {
  id: number;
};
