import { EApplicationType } from '../../entity/application/enum/application-type.enum';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { TApkFormValue } from './apk-form.type';
import { TApplicationIconFormValue } from './application-icon-form.type';
import { TSystemActionFormValue } from './system-action-form.type';
import { TWebPageFormValue } from './web-page-form.type';

export type TApplicationAppValue = TApkFormValue & {
  type: EApplicationType.APP;
  filePath: string;
};

export type TApplicationWebValue = TWebPageFormValue & {
  type: EApplicationType.WEB;
};

export type TApplicationIntentValue = TSystemActionFormValue & {
  type: EApplicationType.INTENT;
};

export type TApplicationFormValue =
  | TApplicationAppValue
  | TApplicationWebValue
  | TApplicationIntentValue;

export type TApplicationFormEmitValue = TApplicationFormValue &
  TApplicationIconFormValue &
  Partial<TApplicationDTO>;
