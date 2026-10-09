import { TApplication } from '../../entity/application/types/application.type';
import { TDeviceFile } from '../../entity/file/types/device-file.type';

export type TDeviceInfo = {
  permissions: number[];
  kioskMode: boolean;
  androidVersion: string;
  batteryLevel: number;
  defaultLauncher: boolean;
  deviceId: string;
  imei: string;
  mdmMode: boolean;
  model: string;
  serial: string;
  applications: TApplication[];
  files: TDeviceFile[];
};
