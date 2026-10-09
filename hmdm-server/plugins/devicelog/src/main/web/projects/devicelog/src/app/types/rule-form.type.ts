import { TToFormGroup } from 'hmdm-ui-kit';

export type TRuleFormValue = {
  active: boolean;
  applicationId: number | null;
  configurationId: number | null;
  filter: string;
  groupId: number | null;
  name: string;
  severity: string;
};

export type TRuleForm = TToFormGroup<TRuleFormValue>;
