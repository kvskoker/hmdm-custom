import { EApplicationType } from '../enum/application-type.enum';
import { TApplicationType } from './application-type.type';

export type TCreateApplicationRequestBase = {
  id?: number;
  name: string;
  showIcon: boolean;
  iconId?: number | null;
  iconText?: string | null;
};

export type TCreateApplicationRequestApp = TCreateApplicationRequestBase & {
  type: EApplicationType.APP;
  arch: string | null;
  pkg: string;
  version: string;
  versionCode?: number;
  filePath?: string | null;
  runAfterInstall: boolean;
  runAtBoot: boolean;
  system: boolean;
};

export type TCreateApplicationRequestWeb = TCreateApplicationRequestBase & {
  type: EApplicationType.WEB;
  url: string;
  useKiosk: boolean;
};

export type TCreateApplicationRequestIntent = TCreateApplicationRequestBase & {
  type: EApplicationType.INTENT;
  intent: string;
};

export type TCreateApplicationRequest =
  | TCreateApplicationRequestApp
  | TCreateApplicationRequestWeb
  | TCreateApplicationRequestIntent;
