export type TAppConfigurationDTO = {
  id: number;
  customerId: number;
  configurationId: number;
  configurationName: string;
  applicationId: number;
  applicationName: string;
  action: number;
  showIcon: boolean;
  remove: boolean;
  outdated: boolean;
  latestVersionText: string;
  currentVersionText: string;
  notify: boolean;
  common: boolean;
};
