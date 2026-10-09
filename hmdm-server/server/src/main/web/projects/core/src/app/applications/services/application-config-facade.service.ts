import { inject, signal, WritableSignal } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import {
  ConfigurationService,
  TLinkConfigurationsToAppRequest,
  TLinkConfigurationsToAppVersionRequest,
} from '../../entity/configuration/services/configuration.service';
import { TAppConfigurationDTO } from '../../entity/configuration/types/app-configuration-dto.type';

export class ApplicationConfigFacadeService {
  private readonly configService = inject(ConfigurationService);
  private readonly _configurations: WritableSignal<TAppConfigurationDTO[]> = signal([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _saving = signal(false);

  configurations = this._configurations.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  saving = this._saving.asReadonly();

  initApplicationConfigurations(applicationId: number): void {
    console.log('applicationId', applicationId);
    this.loadConfigurations(applicationId);
  }

  initVersionConfigurations(versionId: number) {
    console.log('versionId', versionId);
    this.loadVersionConfigurations(versionId);
  }

  updateConfiguration(configId: number, updates: Partial<TAppConfigurationDTO>): void {
    this._configurations.update((configs) =>
      configs.map((config) =>
        config.configurationId === configId ? { ...config, ...updates, notify: true } : config,
      ),
    );
  }

  bulkUpdateConfigurations(selectedConfigIds: number[], action: number): void {
    this._configurations.update((configs) =>
      configs.map((config) =>
        selectedConfigIds.includes(config.configurationId)
          ? {
              ...config,
              action,
              remove: action === 2,
              notify: true,
            }
          : config,
      ),
    );
  }

  updateAllConfigurations(configurations: TAppConfigurationDTO[]): void {
    this._configurations.set(configurations);
  }

  saveConfigurations(applicationId: number): Observable<void> {
    this._saving.set(true);
    this._error.set(null);

    const request: TLinkConfigurationsToAppRequest = {
      applicationId,
      configurations: this._configurations(),
    };

    return this.configService.updateApplicationConfigurations(request).pipe(
      take(1),
      tap({
        next: () => {
          this._saving.set(false);
        },
        error: (error: any) => {
          this._saving.set(false);
          this._error.set(error.message || 'Failed to save configurations');
        },
      }),
    );
  }

  saveVersionConfigurations(versionId: number): Observable<void> {
    this._saving.set(true);
    this._error.set(null);

    const request: TLinkConfigurationsToAppVersionRequest = {
      applicationVersionId: versionId,
      // The backend replaces all links of the version with the posted ones,
      // so "do not install" (action 0) entries must not be sent
      configurations: this._configurations().filter((config) => config.action !== 0),
    };

    return this.configService.updateApplicationVersionConfigurations(request).pipe(
      take(1),
      tap({
        next: () => {
          this._saving.set(false);
        },
        error: (error: any) => {
          this._saving.set(false);
          this._error.set(error.message || 'Failed to save configurations');
        },
      }),
    );
  }

  private loadConfigurations(applicationId: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.configService
      .getConfigurationsPerApp(applicationId)
      .pipe(take(1))
      .subscribe({
        next: (configs) => {
          // Store configurations as-is from API (preserve current action values)
          this._configurations.set(configs);
          this._loading.set(false);
        },
        error: (error: any) => {
          this._error.set('Failed to load configurations');
          this._loading.set(false);
          console.error('Error loading configurations:', error);
        },
      });
  }

  private loadVersionConfigurations(versionId: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.configService
      .getConfigurationsPerVersion(versionId)
      .pipe(take(1))
      .subscribe({
        next: (configs) => {
          console.log('Loaded version configurations:', configs);

          this._configurations.set(configs);
          this._loading.set(false);
        },
        error: (error: any) => {
          this._loading.set(false);
          console.error('Error loading configurations:', error);
        },
      });
  }
}
