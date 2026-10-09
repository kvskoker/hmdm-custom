import { TToFormGroup } from 'hmdm-ui-kit';

export type TConfigurationCommonFormValue = {
  name: string;
  description: string;
  password: string;
  requestUpdates: string;
  appPermissions: string;
  pushOptions: string;
  keepaliveTime?: number;
  gps: boolean | null;
  bluetooth: boolean | null;
  wifi: boolean | null;
  mobileData: boolean | null;
  usbStorage: boolean;
  autoBrightness: boolean | null;
  brightness: number | null;
  manageTimeout: boolean;
  timeout: number | null;
  lockVolume: boolean;
  manageVolume: boolean;
  volume: number | null;
  timeZoneMode: string;
  timeZone: string | null;
  systemUpdateType: number;
  systemUpdateFrom: string | null;
  systemUpdateTo: string | null;
  scheduleAppUpdate: boolean;
  appUpdateFrom: string | null;
  appUpdateTo: string | null;
  downloadUpdates: string;
  passwordMode: string;
  showWifi: boolean;
  runDefaultLauncher: boolean;
  disableScreenshots: boolean;
  autostartForeground: boolean;
};

export type TConfigurationCommonForm = TToFormGroup<TConfigurationCommonFormValue>;
