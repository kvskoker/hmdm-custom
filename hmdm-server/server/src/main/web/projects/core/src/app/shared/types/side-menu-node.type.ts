export type TSideMenuNode = {
  name: string;
  route?: string;
  children?: TSideMenuNode[];
  icon?: string;
  permission?: string;
  opts?: { [key: string]: any };
};
