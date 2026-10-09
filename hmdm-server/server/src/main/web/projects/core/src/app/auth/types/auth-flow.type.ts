export type TAuthFlow =
  | { flow: 'DIRECT' }
  | { flow: 'VERIFY' }
  | { flow: 'SETUP' };
