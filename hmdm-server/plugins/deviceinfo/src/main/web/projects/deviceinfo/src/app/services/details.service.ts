import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse, THttpResponse } from 'hmdm-ui-kit';
import { TDetailsDTO } from '../types/details-dto.type';
import { filter, map, Observable } from 'rxjs';
import { TDynamicRequest } from '../types/dynamic-request.type';
import { TDynamicDTO } from '../types/dynamic-dto.type';
import { TExportRequest } from '../types/export-request.type';

@Injectable({
  providedIn: 'root',
})
export class DetailsService {
  private readonly http = inject(HttpClient);

  getDetails(deviceNumber: string): Observable<TDetailsDTO> {
    return this.http
      .get<
        THttpResponse<TDetailsDTO>
      >(`rest/private/plugin-deviceinfo/info/device/${deviceNumber}`)
      .pipe(map((response) => response.data));
  }

  getDynamic(body: TDynamicRequest): Observable<{ items: TDynamicDTO[]; totalItemsCount: number }> {
    return this.http
      .post<
        THttpPageableResponse<TDynamicDTO>
      >(`rest/private/plugin-deviceinfo/info/searchDynamic`, body)
      .pipe(
        map((response) => ({
          items: response.data.items,
          totalItemsCount: response.data.totalItemsCount,
        })),
      );
  }

  export(body: TExportRequest): Observable<ArrayBuffer> {
    return this.http.post('rest/private/plugin-deviceinfo/info/export', body, {
      responseType: 'arraybuffer',
    });
  }
}
