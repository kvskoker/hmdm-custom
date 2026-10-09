import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { THttpResponse } from '../../../shared/types/http-response.type';
import { TConfigurationBulkRequest } from '../types/configuration-bulk-request.type';
import { TDeviceDTO } from '../types/device-dto.type';
import { TGroupBulkRequest } from '../types/group-bulk-request.type';
import { TSearchDevicesRequest } from '../types/search-devices-request.type';

@Injectable({ providedIn: 'root' })
export class DevicesService {
  private readonly httpClient: HttpClient = inject(HttpClient);

  getAllDevices(body: TSearchDevicesRequest): Observable<THttpPageableResponse<any>> {
    return this.httpClient.post(`rest/private/devices/search`, body).pipe(
      map((response: any) => {
        return {
          data: {
            items: response.data.devices.items.map((device: any) => ({
              ...device,
              configuration: response.data.configurations[device.configurationId],
            })),
            totalItemsCount: response.data.devices.totalItemsCount,
          },
          message: response.message,
          status: response.status,
        };
      }),
    );
  }

  createDevice(body: TDeviceDTO): Observable<THttpResponse<null>> {
    return this.httpClient.put<THttpResponse<null>>(`rest/private/devices`, body);
  }

  updateDevice(body: TDeviceDTO): Observable<THttpResponse<null>> {
    return this.httpClient.put<THttpResponse<null>>(`rest/private/devices`, body);
  }

  delete(id: number): Observable<THttpResponse<null>> {
    return this.httpClient.delete<THttpResponse<null>>(`rest/private/devices/${id}`);
  }

  deleteBulk(ids: number[]): Observable<THttpResponse<null>> {
    return this.httpClient.post<THttpResponse<null>>(`rest/private/devices/deleteBulk`, { ids });
  }

  groupBulk(body: TGroupBulkRequest): Observable<THttpResponse<null>> {
    return this.httpClient.post<THttpResponse<null>>(`rest/private/devices/groupBulk`, body);
  }

  configurationBulk(body: TConfigurationBulkRequest): Observable<THttpResponse<null>> {
    return this.httpClient.put<THttpResponse<null>>(`rest/private/devices`, body);
  }
}
