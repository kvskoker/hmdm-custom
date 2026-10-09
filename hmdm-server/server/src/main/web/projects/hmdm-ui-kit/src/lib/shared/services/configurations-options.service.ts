import { HttpClient } from '@angular/common/http';
import { inject, signal, WritableSignal } from '@angular/core';
import { map, take } from 'rxjs';
import { THttpResponse } from '../types';
import { TOption } from '../types/option.type';

export class ConfigurationsOptionsService {
  private readonly http = inject(HttpClient);
  private readonly _configurationsOptions: WritableSignal<TOption<number>[]> = signal([]);

  configurationsOptions = this._configurationsOptions.asReadonly();

  constructor() {
    this.loadConfigurationsOptions();
  }

  private loadConfigurationsOptions(): void {
    this.http
      .get<THttpResponse<{ id: number; name: string }[]>>('rest/private/configurations/list')
      .pipe(
        take(1),
        map((response) =>
          response.data.map((configuration) => ({
            value: configuration.id,
            viewValue: configuration.name,
          })),
        ),
      )
      .subscribe((options) => {
        this._configurationsOptions.set(options);
      });
  }
}
