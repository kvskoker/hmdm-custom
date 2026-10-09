import { TToFormGroup } from 'hmdm-ui-kit';

export type TRoleFormValue = {
  name: string;
  permissions: number[];
};

export type TRoleForm = TToFormGroup<TRoleFormValue>;
