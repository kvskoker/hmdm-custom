export type TCustomer = {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  email?: string;
  description?: string;
  accountType?: number;
  customerStatus?: string;
  expiryTime?: number | null;
  deviceLimit?: number;
  sizeLimit?: number;
  prefix?: string;
  deviceConfigurationId?: number | null;
  registrationTime?: number;
  lastLoginTime?: number;
};
