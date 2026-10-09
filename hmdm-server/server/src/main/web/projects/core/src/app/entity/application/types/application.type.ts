export type TApplication = {
  id: number;
  name: string;
  pkg: string;
  selected: boolean;
  skipVersion: boolean;
  version: string;
  action: number;
  url?: string;
};
