import { TToFormGroup } from 'hmdm-ui-kit';

export type TGeneralSettingsFormValue = {
  useDefaultLanguage: boolean;
  language: string;
  phoneNumberFormat: string;
  customPropertyName1: string;
  customMultiline1: boolean;
  customSend1: boolean;
  customPropertyName2: string;
  customMultiline2: boolean;
  customSend2: boolean;
  customPropertyName3: string;
  customMultiline3: boolean;
  customSend3: boolean;
  sendDescription: boolean;
  passwordLength: number;
  passwordStrength: number;
  passwordReset: boolean;
  idleLogout: number;
  createNewDevices: boolean;
  newDeviceConfigurationId: number;
  newDeviceGroupId: number;
};

export type TGeneralSettingsForm = TToFormGroup<TGeneralSettingsFormValue>;
