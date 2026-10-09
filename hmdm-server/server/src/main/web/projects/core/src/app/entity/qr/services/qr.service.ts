import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QrCodeData } from '../../../shared/services/qr-facade.service';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  private readonly http = inject(HttpClient);

  fetchQrCodeParams(url: string): Observable<QrCodeData> {
    return this.http.get<QrCodeData>(url);
  }
}
