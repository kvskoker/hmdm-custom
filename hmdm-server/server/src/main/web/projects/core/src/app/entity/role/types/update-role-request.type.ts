import { TCreateRoleRequest } from './create-role-request.type';

export type TUpdateRoleRequest = TCreateRoleRequest & {
  id: number;
};
