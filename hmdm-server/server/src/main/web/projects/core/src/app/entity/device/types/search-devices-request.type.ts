import { THttpPageableRequest } from '../../../shared/types/http-pageable-request.type';
import { THttpSortableRequest } from '../../../shared/types/http-sortable-request.type';

export type TSearchDevicesRequest = THttpPageableRequest &
  THttpSortableRequest & {
    androidVersion?: string | null;
    configurationId?: number | null;
    enrollmentDateFrom?: string | null;
    enrollmentDateTo?: string | null;
    fastSearch?: boolean | null;
    groupId?: number | null;
    imeiChanged?: boolean | null;
    kioskMode?: boolean | null;
    launcherVersion?: string | null;
    mdmMode?: boolean | null;
    onlineLaterMillis?: number | null;
    onlineEarlierMillis?: number | null;
    value?: string | null;
  };
