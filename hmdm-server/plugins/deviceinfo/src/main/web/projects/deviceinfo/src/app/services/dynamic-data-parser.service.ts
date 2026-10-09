import { Injectable } from '@angular/core';
import { TDynamicDTO } from '../types/dynamic-dto.type';

export type TDynamicDataItem = {
  value: any;
  isBoolean: boolean;
  displayed: boolean;
  name: string;
  isEnumerated: boolean;
};

export type TDynamicDataGroup = Record<string, TDynamicDataItem>;

export type TSplitDynamicData = {
  deviceData: TDynamicDataGroup;
  wifiData: TDynamicDataGroup;
  gpsData: TDynamicDataGroup;
  mobile1Data: TDynamicDataGroup;
  mobile2Data: TDynamicDataGroup;
};

export const DEVICE_PARAMS = [
  'deviceBatteryLevel',
  'deviceBatteryCharging',
  'deviceIpAddress',
  'deviceKeyguard',
  'deviceRingVolume',
  'deviceWifiEnabled',
  'deviceMobileDataEnabled',
  'deviceGpsEnabled',
  'deviceBluetoothEnabled',
  'deviceUsbEnabled',
  'deviceMemoryTotal',
  'deviceMemoryAvailable',
];

export const WIFI_PARAMS = [
  'wifiRssi',
  'wifiSsid',
  'wifiSecurity',
  'wifiState',
  'wifiIpAddress',
  'wifiTx',
  'wifiRx',
];

export const GPS_PARAMS = ['gpsState', 'gpsLat', 'gpsLon', 'gpsAlt', 'gpsSpeed', 'gpsCourse'];

export const MOBILE1_PARAMS = [
  'mobile1Rssi',
  'mobile1Carrier',
  'mobile1DataEnabled',
  'mobile1IpAddress',
  'mobile1State',
  'mobile1SimState',
  'mobile1Tx',
  'mobile1Rx',
];

export const MOBILE2_PARAMS = [
  'mobile2Rssi',
  'mobile2Carrier',
  'mobile2DataEnabled',
  'mobile2IpAddress',
  'mobile2State',
  'mobile2SimState',
  'mobile2Tx',
  'mobile2Rx',
];

@Injectable({
  providedIn: 'root',
})
export class DynamicDataParserService {
  splitDynamicInfoRecord(record: TDynamicDTO): TSplitDynamicData {
    const deviceData: TDynamicDataGroup = {};
    const wifiData: TDynamicDataGroup = {};
    const gpsData: TDynamicDataGroup = {};
    const mobile1Data: TDynamicDataGroup = {};
    const mobile2Data: TDynamicDataGroup = {};

    for (const p in record) {
      if (record.hasOwnProperty(p)) {
        let target: TDynamicDataGroup | undefined;

        if (p.startsWith('device')) {
          target = deviceData;
        } else if (p.startsWith('wifi')) {
          target = wifiData;
        } else if (p.startsWith('gps')) {
          target = gpsData;
        } else if (p.startsWith('mobile1')) {
          target = mobile1Data;
        } else if (p.startsWith('mobile2')) {
          target = mobile2Data;
        }

        if (target) {
          const value = (record as any)[p];
          target[p] = {
            value,
            isBoolean: typeof value === 'boolean',
            displayed: !p.endsWith('DataIncluded'),
            name: p,
            isEnumerated: p.endsWith('State'),
          };
        }
      }
    }

    return {
      deviceData,
      wifiData,
      gpsData,
      mobile1Data,
      mobile2Data,
    };
  }
}
