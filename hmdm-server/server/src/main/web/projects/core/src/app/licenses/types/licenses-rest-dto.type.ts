export type TLicensesRestDTO = {
  id: number;
  pluginName: string;
  license: string;
  signature: string;
  main: boolean;
  domain: string;
  expiryDate: number;
  devices: number;
  purchaseLink: string;
  status: string;
}

export type TLicensesRestAPI = {
  data: TLicensesRestDTO[];
  message: string;
  status: string;
}


