export type TDeviceDTO = {
  id?: number;
  configurationId: number | null;
  groups: { id: number }[];
  description: string | null;
  imei: string;
  number: string;
  phone: string;
  custom1: string | null;
  custom2: string | null;
  custom3: string | null;
};
