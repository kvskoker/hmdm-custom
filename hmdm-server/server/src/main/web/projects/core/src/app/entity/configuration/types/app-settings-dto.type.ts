export type TAppSettingsDTO = {
  id?: number;
  applicationId: number;
  name: string;
  type?: string;
  value: string;
  lastUpdate: number;
  readonly?: boolean;
  extRefId?: number;
  applicationPkg: string;
  applicationName: string;
  variable: boolean;
};
