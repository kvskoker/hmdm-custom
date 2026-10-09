import { TToFormGroup } from '../../shared/types/to-form-group.type';

export type TGroupBulkFormValue = {
  groups: number[];
  action: 'set' | 'remove';
};

export type TGroupBulkForm = TToFormGroup<TGroupBulkFormValue>;
