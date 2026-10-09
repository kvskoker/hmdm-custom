export type TSummaryResponse = {
  devicesTotal: number;
  devicesEnrolled: number;
  devicesEnrolledLastMonth: number;
  statusSummary: TSummary[];
  installSummary: TSummary[];
  deviceEnrolledMonthly: TSummary[];
  topConfigs: string[];
  statusOfflineByConfig: number[];
  statusOnlineByConfig: number[];
  statusIdleByConfig: number[];
  appFailureByConfig: number[];
  appMismatchByConfig: number[];
  appSuccessByConfig: number[];
};

export type TSummary = {
  stringAttr: string;
  intAttr: number;
  number: number;
};
