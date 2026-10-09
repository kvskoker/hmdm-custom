import { TOption } from 'hmdm-ui-kit';
import { TDevicesSettingsFormValue } from '../types/devices-settings-form.type';

export const DEVICES_SETTING_COLUMNS: { column: keyof TDevicesSettingsFormValue; label: string }[] =
  [
    { column: 'columnDisplayedAndroidVersion', label: 'form.settings.common.android.version' },
    { column: 'columnDisplayedBatteryLevel', label: 'form.settings.common.battery.level' },
    { column: 'columnDisplayedDefaultLauncher', label: 'form.settings.common.default.launcher' },
    {
      column: 'columnDisplayedDeviceAppInstallStatus',
      label: 'form.settings.common.status.installation',
    },
    { column: 'columnDisplayedDeviceConfiguration', label: 'form.settings.common.config' },
    { column: 'columnDisplayedDeviceDate', label: 'form.settings.common.date' },
    { column: 'columnDisplayedDeviceDesc', label: 'form.settings.common.desc' },
    { column: 'columnDisplayedDeviceFilesStatus', label: 'form.settings.common.status.files' },
    { column: 'columnDisplayedDeviceGroup', label: 'form.settings.common.group' },
    { column: 'columnDisplayedDeviceImei', label: 'form.settings.common.imei' },
    { column: 'columnDisplayedDeviceModel', label: 'form.settings.common.phone.model' },
    { column: 'columnDisplayedDeviceNumber', label: 'form.settings.common.device.number' },
    {
      column: 'columnDisplayedDevicePermissionsStatus',
      label: 'form.settings.common.status.permissions',
    },
    { column: 'columnDisplayedDevicePhone', label: 'form.settings.common.phone.number' },
    { column: 'columnDisplayedDeviceStatus', label: 'form.settings.common.status' },
    { column: 'columnDisplayedEnrollmentDate', label: 'form.settings.common.enrollment.date' },
    { column: 'columnDisplayedKioskMode', label: 'form.settings.common.kiosk.mode' },
    { column: 'columnDisplayedLauncherVersion', label: 'form.settings.common.launcher.version' },
    { column: 'columnDisplayedMdmMode', label: 'form.settings.common.mdm.mode' },
    { column: 'columnDisplayedPublicIp', label: 'form.settings.common.publicip' },
    { column: 'columnDisplayedSerial', label: 'form.settings.common.serial' },
  ];
