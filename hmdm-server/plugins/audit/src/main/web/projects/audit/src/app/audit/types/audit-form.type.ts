import { TToFormGroup } from 'hmdm-ui-kit';

export type TAuditFormValue = {
  date: {
    start: Date | null;
    end: Date | null;
  } | null;
  messageFilter: string;
};

export type TAuditForm = TToFormGroup<TAuditFormValue>;
