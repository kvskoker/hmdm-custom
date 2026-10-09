import { TToFormGroup } from 'hmdm-ui-kit';

export type TDevicesSettingsFormValue = {
  columnDisplayedAndroidVersion: boolean | null;
  columnDisplayedBatteryLevel: boolean | null;
  columnDisplayedCustom1: boolean | null;
  columnDisplayedCustom2: boolean | null;
  columnDisplayedCustom3: boolean | null;
  columnDisplayedDefaultLauncher: boolean | null;
  columnDisplayedDeviceAppInstallStatus: boolean | null;
  columnDisplayedDeviceConfiguration: boolean | null;
  columnDisplayedDeviceDate: boolean | null;
  columnDisplayedDeviceDesc: boolean | null;
  columnDisplayedDeviceFilesStatus: boolean | null;
  columnDisplayedDeviceGroup: boolean | null;
  columnDisplayedDeviceImei: boolean | null;
  columnDisplayedDeviceModel: boolean | null;
  columnDisplayedDeviceNumber: boolean | null;
  columnDisplayedDevicePermissionsStatus: boolean | null;
  columnDisplayedDevicePhone: boolean | null;
  columnDisplayedDeviceStatus: boolean | null;
  columnDisplayedEnrollmentDate: boolean | null;
  columnDisplayedKioskMode: boolean | null;
  columnDisplayedLauncherVersion: boolean | null;
  columnDisplayedMdmMode: boolean | null;
  columnDisplayedPublicIp: boolean | null;
  columnDisplayedSerial: boolean | null;
  roleId: number;
};

export type TDevicesSettingsForm = TToFormGroup<TDevicesSettingsFormValue>;
