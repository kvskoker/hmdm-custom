export type TFileUploadDTO = {
  serverPath: string;
  fileDetails: unknown | null;
  application: unknown | null;
  complete: boolean | null;
  exists: boolean | null;
  name: string;
};
