import { THttpPageableRequest } from 'hmdm-ui-kit';
import { TDynamicRequest } from './dynamic-request.type';

export type TExportRequest = TDynamicRequest & {
  fields: string[];
  locale: string;
};
