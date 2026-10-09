export type TFileConfigDTO = {
  id: number;
  customerId: number;
  configurationId: number;
  configurationName: string;
  fileId: number;
  fileName: string | null;
  upload: boolean;
  remove: boolean;
  notify: boolean;
  common: boolean;
};
