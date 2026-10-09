import { TToFormGroup } from '../../shared/types/to-form-group.type';

export type TConfigurationBulkFormValue = {
  configurationId: number | null;
};

export type TConfigurationBulkForm = TToFormGroup<TConfigurationBulkFormValue>;
