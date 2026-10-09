export type TVersionDTO = {
  id: number;
  applicationId: number;
  version: string;
  versionCode: number;
  url: string;
  split: boolean;
  urlArmeabi: string | null;
  urlArm64: string | null;
  deletionProhibited: boolean;
  commonApplication: boolean;
  system: boolean;
  type: string;
  apkHash: string | null;
  arch: string | null;
  filePath: string | null;
};
