import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { take } from 'rxjs';
import { ConfigurationService } from '../../entity/configuration/services/configuration.service';
import { TConfigurationDTO } from '../../entity/configuration/types/configuration-dto.type';
import { ConfigurationService as SharedConfigurationService } from '../../shared/services/configuration.service';
import { TConfigurationCopyFormValue } from '../types/configuration-copy-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsFacadeService {
  private readonly configurationsService = inject(ConfigurationService);
  private readonly sharedConfigurationService = inject(SharedConfigurationService);

  private readonly _configurations: WritableSignal<TConfigurationDTO[]> = signal([]);
  private readonly term: WritableSignal<string> = signal('');

  configurations: Signal<TConfigurationDTO[]> = this._configurations.asReadonly();
  tableData: Signal<TConfigurationDTO[]> = computed(() => {
    const term = this.term();
    return this._configurations().filter((config) => config.name.toLowerCase().includes(term));
  });

  setSearchTerm(term: string): void {
    this.term.set(term.toLowerCase());
  }

  searchConfigurations(): void {
    this.configurationsService
      .searchConfigurations('')
      .pipe(take(1))
      .subscribe((configurations) => {
        this._configurations.set(configurations);
      });
  }

  deleteConfiguration(id: number): void {
    this.configurationsService
      .deleteConfiguration(id)
      .pipe(take(1))
      .subscribe(() => {
        this.searchConfigurations();
        this.sharedConfigurationService.fetchAll();
      });
  }

  copyConfiguration(id: number, value: TConfigurationCopyFormValue): void {
    this.configurationsService
      .copyConfiguration(id, value)
      .pipe(take(1))
      .subscribe(() => {
        this.searchConfigurations();
        this.sharedConfigurationService.fetchAll();
      });
  }
}
