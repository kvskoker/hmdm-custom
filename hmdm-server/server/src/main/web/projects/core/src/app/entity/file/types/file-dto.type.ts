export type TFileDTO = {
  id: number;
  filePath: string | null;
  description: string;
  url: string;
  size: number;
  uploadTime: number;
  devicePath: string;
  external: boolean;
  replaceVariables: boolean;
  usedByApps: boolean | null;
  usedByIcons: string[];
  usedByConfigurations: string[];
};
