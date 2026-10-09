export type TAPKFileDetails = {
  pkg: string;
  version: string;
  versionCode: number;
  arch: string | null;
  name: string;
};

export type TFileUploadResult = {
  name: string;
  serverPath: string;
  fileDetails: TAPKFileDetails | null;
  application: any | null; // Can be typed more specifically if needed
  complete: boolean | null;
  exists: boolean | null;
};
