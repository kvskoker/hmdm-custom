import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { take } from 'rxjs';
import { TOption } from 'hmdm-ui-kit';
import { TGroup } from '../types/group.type';
import { THttpResponse } from '../types/http-response.type';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly http: HttpClient = inject(HttpClient);

  private _allGroups: WritableSignal<TGroup[]> = signal([]);
  allGroups = this._allGroups.asReadonly();
  groupsOptions: Signal<TOption<number>[]> = computed(() =>
    this._allGroups().map((group) => ({
      viewValue: group.name,
      value: group.id,
    })),
  );

  constructor() {
    this.fetchAll();
  }

  fetchAll(): void {
    this.http
      .get<THttpResponse<TGroup[]>>(`rest/private/groups/search`)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this._allGroups.set(response.data || []);
        },
        error: (error) => {
          console.error('Error fetching groups:', error);
          this._allGroups.set([]);
        },
      });
  }
}
