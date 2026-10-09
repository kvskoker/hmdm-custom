export type TApplicationDTO = {
  applicationName: string;
  applicationPkg: string;
  versionInstalled: string | null;
  versionRequired: string;
  versionValid: boolean;
};
