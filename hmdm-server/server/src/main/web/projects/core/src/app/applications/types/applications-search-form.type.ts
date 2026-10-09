import { TToFormGroup } from 'hmdm-ui-kit';

export type TApplicationsSearchFormValue = {
  showSystem: boolean | null;
  showMy: boolean | null;
};

export type TApplicationsSearchForm = TToFormGroup<TApplicationsSearchFormValue>;
