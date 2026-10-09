import { HttpClient } from '@angular/common/http';
import { inject, signal, WritableSignal } from '@angular/core';
import { map, take } from 'rxjs';
import { THttpResponse } from '../types';
import { TOption } from '../types/option.type';

export class GroupsOptionsService {
  private readonly http = inject(HttpClient);
  private readonly _groupsOptions: WritableSignal<TOption<number>[]> = signal([]);

  groupsOptions = this._groupsOptions.asReadonly();

  constructor() {
    this.loadGroupsOptions();
  }

  private loadGroupsOptions(): void {
    this.http
      .get<THttpResponse<{ id: number; name: string }[]>>('rest/private/groups/search')
      .pipe(
        take(1),
        map((response) =>
          response.data.map((group) => ({ value: group.id, viewValue: group.name })),
        ),
      )
      .subscribe((options) => {
        this._groupsOptions.set(options);
      });
  }
}
