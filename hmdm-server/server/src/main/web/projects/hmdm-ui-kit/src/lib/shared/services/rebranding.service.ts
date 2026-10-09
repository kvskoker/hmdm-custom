import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, NEVER, take } from 'rxjs';
import { THttpResponse } from '../types';
import { Title } from '@angular/platform-browser';

export type TRebrandingInfo = {
  appName: string;
  vendorName: string;
  vendorLink: string;
  signupLink: string;
  termsLink: string;
  legacyUrl?: string;
};

const DEFAULT_REBRANDING: TRebrandingInfo = {
  appName: 'Headwind MDM',
  vendorName: 'Headwind Solutions',
  vendorLink: 'https://h-mdm.com',
  signupLink: '',
  termsLink: '',
  legacyUrl: ''
};

function fixEmptyValues(value: TRebrandingInfo): TRebrandingInfo {
  return {
    appName: value.appName || DEFAULT_REBRANDING.appName,
    vendorName: value.vendorName || DEFAULT_REBRANDING.vendorName,
    vendorLink: value.vendorLink || DEFAULT_REBRANDING.vendorLink,
    signupLink: value.signupLink || DEFAULT_REBRANDING.signupLink,
    termsLink: value.termsLink || DEFAULT_REBRANDING.termsLink,
    legacyUrl: value.legacyUrl || DEFAULT_REBRANDING.legacyUrl,
  };
}

@Injectable({
  providedIn: 'root',
})
export class RebrandingService {
  private readonly http = inject(HttpClient);
  private readonly titleService = inject(Title);

  private readonly _rebranding = signal<TRebrandingInfo>(DEFAULT_REBRANDING);

  readonly rebranding = this._rebranding.asReadonly();

  constructor() {
    this.load();
  }

  load(): void {
    this.http
      .get<THttpResponse<TRebrandingInfo>>('rest/public/brand/name')
      .pipe(
        take(1),
        map((response) => {
          if (response.status === 'OK') {
            return fixEmptyValues(response.data);
          }
          return DEFAULT_REBRANDING;
        }),
        catchError(() => {
          this._rebranding.set(DEFAULT_REBRANDING);
          return NEVER;
        }),
      )
      .subscribe((info) => {
        this._rebranding.set(info);
        this.titleService.setTitle(info.appName);
      });
  }
}
