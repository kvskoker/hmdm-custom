import { Component, computed, inject } from '@angular/core';
import { DetailsFacadeService } from '../../services/details-facade.service';
import {
  DynamicDataParserService,
  DEVICE_PARAMS,
  WIFI_PARAMS,
  GPS_PARAMS,
  MOBILE1_PARAMS,
  MOBILE2_PARAMS,
} from '../../services/dynamic-data-parser.service';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from 'hmdm-ui-kit';

@Component({
  selector: 'di-device-info',
  templateUrl: './device-info.html',
  styleUrl: './device-info.scss',
  imports: [DatePipe, TranslatePipe],
})
export class DeviceInfo {
  private readonly detailsFacadeService = inject(DetailsFacadeService);
  private readonly dynamicDataParser = inject(DynamicDataParserService);

  details = this.detailsFacadeService.details;

  readonly deviceFieldsOrder = DEVICE_PARAMS;
  readonly wifiFieldsOrder = WIFI_PARAMS;
  readonly gpsFieldsOrder = GPS_PARAMS;
  readonly mobile1FieldsOrder = MOBILE1_PARAMS;
  readonly mobile2FieldsOrder = MOBILE2_PARAMS;

  splitData = computed(() => {
    const details = this.details();
    if (!details?.latestDynamicData) {
      return null;
    }
    return this.dynamicDataParser.splitDynamicInfoRecord(details.latestDynamicData);
  });
}
