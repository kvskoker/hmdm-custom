import { TPermissionDTO } from './permission-dto.type';

export type TRoleDTO = {
  id: number;
  name: string;
  description: string | null;
  superAdmin: boolean;
  permissions: TPermissionDTO[];
};
