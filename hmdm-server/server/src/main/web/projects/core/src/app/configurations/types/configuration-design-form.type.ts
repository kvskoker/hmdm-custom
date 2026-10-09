import { TToFormGroup } from 'hmdm-ui-kit';

export type TConfigurationDesignFormValue = {
  useDefaultDesignSettings: boolean;
  backgroundColor: string | null;
  textColor: string | null;
  backgroundImageUrl: string | null;
  iconSize: string | null;
  desktopHeader: string | null;
  desktopHeaderTemplate: string | null;
  orientation: number | null;
  displayStatus: boolean;
};

export type TConfigurationDesignForm = TToFormGroup<TConfigurationDesignFormValue>;
