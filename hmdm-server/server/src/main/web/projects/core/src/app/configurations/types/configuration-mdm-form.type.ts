import { TToFormGroup } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';

export type TConfigurationMDMFormValue = {
  mainAppId: number | null;
  eventReceivingComponent: string;
  kioskMode: boolean;
  contentAppId: number | null;

  //Kiosk mode
  kioskHome: boolean;
  kioskRecents: boolean;
  kioskNotifications: boolean;
  kioskSystemInfo: boolean;
  kioskKeyguard: boolean;
  kioskLockButtons: boolean;
  kioskExit: boolean;
  kioskScreenOn: boolean;

  //Not kiosk
  permissive: boolean;
  lockSafeSettings: boolean;
  allowedClasses: string;

  wifiSSID: string;
  wifiPassword: string;
  wifiSecurityType: string;
  launcherUrl: string;
  qrParameters: string;
  mobileEnrollment: boolean;
  encryptDevice: boolean;

  restrictions: string;
  newServerUrl: string;
};

export type TConfigurationMDMForm = TToFormGroup<TConfigurationMDMFormValue>;
