export type TCustomerFormValue = {
  name: string;
  firstName: string;
  lastName: string;
  language: string;
  email: string;
  description: string;
  accountType: number | null;
  customerStatus: string | null;
  expiryTime: Date | null;
  deviceLimit: number | null;
  sizeLimit: number | null;
  prefix: string;
  deviceConfigurationId: number | null;
  configurationIds: number[];
  copyDesign: boolean;
};
