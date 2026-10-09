import { TApplication } from '../../application/types/application.type';
import { TDeviceFile } from '../../file/types/device-file.type';

export type TConfiguration = {
  qrCodeKey: string;
  id: number;
  name: string;
  baseUrl: string;
  applications: TApplication[];
  files: TDeviceFile[];
};
