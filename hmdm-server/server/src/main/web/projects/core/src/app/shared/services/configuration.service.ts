import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { TOption } from 'hmdm-ui-kit';
import { environment } from '../../../environments/environment';
import { TConfiguration } from '../../entity/configuration/types/configuration.type';
import { THttpResponse } from '../types/http-response.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly BASE_URL = environment.baseApiUrl;

  private _allConfigurations: WritableSignal<TConfiguration[]> = signal([]);
  allConfigurations = this._allConfigurations.asReadonly();
  configOptions: Signal<TOption<number>[]> = computed(() =>
    this._allConfigurations().map((config) => ({
      viewValue: config.name,
      value: config.id,
    })),
  );

  constructor() {
    this.fetchAll();
  }

  fetchAll(): void {
    this.http
      .get<THttpResponse<TConfiguration[]>>(`${this.BASE_URL}rest/private/configurations/list`)
      .subscribe({
        next: (response) => {
          this._allConfigurations.set(response.data || []);
        },
        error: (error) => {
          console.error('Error fetching configurations:', error);
          this._allConfigurations.set([]);
        },
      });
  }
}
