import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpContext, HttpHeaders} from '@angular/common/http';
import {TPluginLicenseKey} from '../types/plugin-license-key.type';
import {catchError, forkJoin, map, Observable, of, shareReplay, take, tap} from 'rxjs';
import {SKIP_ALERT, THttpResponse} from 'hmdm-ui-kit';

@Injectable({providedIn: 'root'})
export class LicenseService {
  private readonly http = inject(HttpClient);

  pluginLicenseKeyData: WritableSignal<TPluginLicenseKey | null> = signal<TPluginLicenseKey | null>(null);
  pluginLicenses = signal<Record<string, boolean>>({});

  private validPluginLicenses$: Observable<Record<string, boolean>> | null = null;

  private readonly pluginNames: string[] = [];
  private readonly pluginLicenseKeyUrl = 'rest/public/plugin-license/key';

  constructor() {
    this.pluginNames = [
      ...((window as any).__DYNPLUGINS__?.map((plugin: any) => plugin.identifier) ?? [])
    ];
  }

  private getLicenseUrlByPlugin(plugin: string): string {
    return `rest/private/plugin-${plugin}/license`;
  }

  private fetchPluginLicenseKey(): Observable<THttpResponse<TPluginLicenseKey>> {
    return this.http.get<THttpResponse<TPluginLicenseKey>>(this.pluginLicenseKeyUrl,
    {
      context: new HttpContext().set(SKIP_ALERT, true),
    });
  }

  getPluginLicenseKey(): Observable<TPluginLicenseKey> {
    return this.fetchPluginLicenseKey().pipe(map(v => v.data));
  }

  putPluginLicenseKey(key: string): Observable<TPluginLicenseKey> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.put<THttpResponse<TPluginLicenseKey>>(this.pluginLicenseKeyUrl, key, { headers })
      .pipe(map(v => v.data));
  }

  getValidPluginLicenses(): Observable<Record<string, boolean>> {
    if (!this.validPluginLicenses$) {
      const requests$ = this.pluginNames.map(plugin =>
        this.http.get<THttpResponse<TPluginLicenseKey>>(this.getLicenseUrlByPlugin(plugin)).pipe(
          map(v => ({ plugin, valid: !!v?.data?.valid })),
          catchError(() => of({ plugin, valid: false }))
        )
      );

      this.validPluginLicenses$ = forkJoin(requests$).pipe(
        map(results =>
          results.reduce(
            (acc, curr) =>
              ({ ...acc, [curr.plugin]: curr.valid }), {} as Record<string, boolean>)
        ),
        tap(res => this.pluginLicenses.set(res)),
        shareReplay(1)
      );
    }

    return this.validPluginLicenses$;
  }

  refreshLicenses(): void {
    this.validPluginLicenses$ = null;
    this.getValidPluginLicenses().pipe(take(1)).subscribe();

    this.fetchPluginLicenseKey()
      .pipe(take(1))
      .subscribe((response) => {
        if (response.status !== 'ERROR') {
          this.pluginLicenseKeyData.set(response.data);
        }
      });
  }
}
