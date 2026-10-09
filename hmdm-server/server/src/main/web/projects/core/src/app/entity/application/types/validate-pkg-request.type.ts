export type TValidatePkgRequest = {
  arch: string | null;
  type: string;
  pkg: string;
  name: string;
  version: string;
  versionCode: number;
  filePath: string;
  runAtBoot?: boolean;
  showIcon?: boolean;
  useKiosk?: boolean;
  runAfterInstall?: boolean;
  system?: boolean;
  autoUpdateDisplayed?: boolean;
  applicationId?: number;
};
