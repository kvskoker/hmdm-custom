import { TConfiguration } from '../../entity/configuration/types/configuration.type';
import { TDeviceInfo } from './device-info.type';

export type TDevice = {
  id?: number;
  statusCode: 'red' | 'green' | 'yellow' | 'gray';
  serial: string;
  publicIp: string;
  number: string;
  mdmMode: boolean;
  lastUpdate: number;
  imei: string;
  enrollTime: number;
  androidVersion: string;
  description: string;
  configuration: TConfiguration;
  groups: { id: number; name: string }[];
  phone: string;
  info?: TDeviceInfo;
  custom1?: string;
  custom2?: string;
  custom3?: string;
};
