import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TLicensesRestAPI, TLicensesRestDTO} from '../types/licenses-rest-dto.type';
import {finalize, map, take} from 'rxjs';
import {LicenseService} from '../../auth/services/license.service';
import {THttpResponse} from 'hmdm-ui-kit';

@Injectable({providedIn: 'root'})
export class LicensesRestService {
  private readonly http = inject(HttpClient);
  private readonly licenseService = inject(LicenseService);
  private readonly licensesRestUrl = 'rest/private/plugin/license';

  private _licensesData: WritableSignal<TLicensesRestDTO[]> = signal<TLicensesRestDTO[]>([]);
  licensesData = this._licensesData.asReadonly();
  private _licensesLoading: WritableSignal<boolean> = signal<boolean>(false);
  licensesLoading = this._licensesLoading.asReadonly();

  getLicensesData() {
    this._licensesLoading.set(true);

    this.http.get<TLicensesRestAPI>(`${this.licensesRestUrl}/search`)
    .pipe(
      take(1),
      map(value => value.data),
      finalize(() => this._licensesLoading.set(false)),
    )
    .subscribe({
      next: (value) => {
        this._licensesData.set(value);
      }
    });
  }

  deleteLicense(licenseId: number) {
    this.http.delete<THttpResponse<any>>(`${this.licensesRestUrl}/${licenseId}`)
    .subscribe({
      next: (value) => {
        if (value.status !== "ERROR") {
          this.getLicensesData();
          this.licenseService.refreshLicenses();
        }
      }
    });
  }

  addLicense(key: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.http.put<TLicensesRestAPI>(this.licensesRestUrl, key, {headers})
    .subscribe({
      next: (value) => {
        if (value.status !== "ERROR") {
          this.getLicensesData();
          this.licenseService.refreshLicenses();
        }
      }
    });
  }
}
