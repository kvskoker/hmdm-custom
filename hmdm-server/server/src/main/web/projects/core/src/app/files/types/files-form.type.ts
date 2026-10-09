import { TToFormGroup } from 'hmdm-ui-kit';

export type TFilesFormValue = {
  description: string;
  external: boolean;
  externalUrl?: string;
  file?: File;
  filePath?: string;
  devicePath: string;
  replaceVariables: boolean;
};

export type TFilesForm = TToFormGroup<TFilesFormValue>;
