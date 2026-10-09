export type TPluginLicenseKey = {
  id: number;
  valid: boolean;
  expiryDays: number;
  devices: number | null;
  purchaseLink: string | null;
}
