export type TConfigurationFileDTO = {
  id?: number;
  description: string | null;
  externalUrl: string | null;
  filePath: string | null;
  checksum: string | null;
  remove: boolean;
  lastUpdate: number;
  fileId: number;
  url: string;
  replaceVariables: boolean;
  devicePath: string;
  overrideDevicePath?: boolean;
};
