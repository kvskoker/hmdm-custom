import { TStatus, TStatusColor } from 'hmdm-ui-kit';

export const STATUS_MAPPER: Record<string, TStatus> = {
  red: { color: 'red', tooltip: 'Offline' },
  green: { color: 'green', tooltip: 'Online' },
  yellow: { color: 'yellow', tooltip: 'Away' },
  gray: { color: 'gray', tooltip: 'Unknown' },
};
