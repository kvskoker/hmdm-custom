import { TDevicesSettingsFormValue } from '../../settings/types/devices-settings-form.type';

export const DEVICE_COLUMNS_DISPLAY: {
  condition: keyof TDevicesSettingsFormValue;
  column: string;
}[] = [
  { condition: 'columnDisplayedDeviceStatus', column: 'statusCode' },
  { condition: 'columnDisplayedDeviceDate', column: 'lastUpdate' },
  { condition: 'columnDisplayedDeviceNumber', column: 'number' },
  { condition: 'columnDisplayedDeviceImei', column: 'imei' },
  { condition: 'columnDisplayedDevicePhone', column: 'phone' },
  { condition: 'columnDisplayedDeviceModel', column: 'info.model' },
  { condition: 'columnDisplayedDevicePermissionsStatus', column: 'permissionStatus' },
  { condition: 'columnDisplayedDeviceAppInstallStatus', column: 'installationStatus' },
  { condition: 'columnDisplayedDeviceFilesStatus', column: 'filesStatus' },
  { condition: 'columnDisplayedDeviceConfiguration', column: 'configurationId' },
  { condition: 'columnDisplayedDeviceDesc', column: 'description' },
  { condition: 'columnDisplayedDeviceGroup', column: 'group' },
  { condition: 'columnDisplayedLauncherVersion', column: 'launcherVersion' },
  { condition: 'columnDisplayedBatteryLevel', column: 'info.batteryLevel' },
  { condition: 'columnDisplayedMdmMode', column: 'mdmMode' },
  { condition: 'columnDisplayedDefaultLauncher', column: 'info.defaultLauncher' },
  { condition: 'columnDisplayedKioskMode', column: 'info.kioskMode' },
  { condition: 'columnDisplayedAndroidVersion', column: 'androidVersion' },
  { condition: 'columnDisplayedEnrollmentDate', column: 'enrollTime' },
  { condition: 'columnDisplayedSerial', column: 'serial' },
  { condition: 'columnDisplayedPublicIp', column: 'publicIp' },
  { condition: 'columnDisplayedCustom1', column: 'custom1' },
  { condition: 'columnDisplayedCustom2', column: 'custom2' },
  { condition: 'columnDisplayedCustom3', column: 'custom3' },
];
