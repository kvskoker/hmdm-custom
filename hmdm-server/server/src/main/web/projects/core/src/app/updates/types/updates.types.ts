export type TAppUpdate = {
  pkg: string;
  name: string;
  currentVersion: string;
  version: string;
  outdated: boolean;
  updateDisabled: boolean;
  updateDisableReason?: string;
  updateDisableReasonLocalized?: string;
  downloaded: boolean;
}

export type TUpdateForm = {
  update: boolean;
  sendStats: boolean;
  updates?: TAppUpdate[];
}
