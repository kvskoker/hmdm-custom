export type TSearchDevicesFormValue = {
  androidVersion: string | null;
  configurationId: number | null;
  enrollmentDate: {
    start: Date | null;
    end: Date | null;
  } | null;
  fastSearch: boolean | null;
  groupId: number | null;
  imeiChanged: boolean | null;
  kioskMode: boolean | null;
  launcherVersion: string | null;
  installationStatus: string | null;
  mdmMode: boolean | null;
  status: string | null;
  time: string | null;
  customTime: string | null;
};
