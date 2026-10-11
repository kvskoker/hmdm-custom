import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceRegisterService {
  private http = inject(HttpClient);
  async request<T>(path: string, body?: unknown): Promise<T> {
    const response = await firstValueFrom(this.http.request<{status: string; data: T; message?: string}>(
      body === undefined ? 'GET' : 'POST', `rest/private/device-register/${path}`, { body,
        headers: body instanceof Blob ? {'Content-Type': 'application/octet-stream'} : {},
      }));
    if (response.status !== 'OK') throw new Error(response.message || 'Request failed');
    return response.data;
  }
  async export(filters: unknown) {
    let blob: Blob;
    try {
      blob = await firstValueFrom(this.http.post('rest/private/device-register/export', filters, {responseType: 'blob'}));
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.error instanceof Blob) {
        let message: string | undefined;
        try { message = JSON.parse(await e.error.text()).message; } catch { /* Non-JSON proxy error. */ }
        if (message) throw new Error(message);
      }
      throw e;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href=url; link.download='devices.xlsx'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  error(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      return e.status === 403 ? 'You do not have permission for this action.' :
        typeof e.error?.message === 'string' ? e.error.message :
        'Request failed. Check the workbook headings, text device numbers, field lengths and device access.';
    }
    return e instanceof Error ? e.message : 'Request failed';
  }
}
