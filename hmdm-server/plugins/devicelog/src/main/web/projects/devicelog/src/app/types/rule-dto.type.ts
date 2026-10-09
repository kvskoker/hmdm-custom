export interface TRuleDTO {
  name: string;
  active: boolean;
  applicationId: number;
  severity: string;
  filter: string;
  groupId: number | null;
  configurationId: number | null;
  applicationPkg: string;
  groupName: string | null;
  configurationName: string | null;
  id: number;
  settingId: number;
  identifier: string;
  devices: { id: number; name: string }[];
}
