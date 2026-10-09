import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class FleetApi {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  async request<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const response = await firstValueFrom(this.http.request<{status: string; data: T; message?: string}>(
      method, `rest/${path}`, { body },
    ));
    if (response.status !== 'OK') {
      throw new Error(this.translate.instant(response.message || 'error.request.failure'));
    }
    return response.data;
  }
}
