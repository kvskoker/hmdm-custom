export type TCreateFileRequest = {
  description: string;
  devicePath: string;
  external: boolean;
  replaceVariables: boolean;
  externalUrl?: string;
  filePath?: string;
  tmpPath?: string;
};
