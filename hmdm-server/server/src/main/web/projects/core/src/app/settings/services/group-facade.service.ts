import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { finalize, Observable, take } from 'rxjs';
import { GroupsService } from '../../entity/group/services/group.service';
import { TGroupDTO } from '../../entity/group/types/group-dto.type';
import { TGroupFormValue } from '../types/group-form.type';

@Injectable({
  providedIn: 'root',
})
export class GroupFacadeService {
  private readonly groupService = inject(GroupsService);

  private readonly _groups: WritableSignal<TGroupDTO[]> = signal([]);
  private readonly _searchTerm: WritableSignal<string> = signal('');

  groups = this._groups.asReadonly();
  isLoadingGroups: WritableSignal<boolean> = signal(false);

  constructor() {
    this.searchGroups();
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this.searchGroups();
  }

  createGroup(groupData: TGroupFormValue): Observable<void> {
    return this.groupService.createGroup(groupData);
  }

  updateGroup(group: TGroupDTO): Observable<void> {
    return this.groupService.updateGroup(group);
  }

  deleteGroup(id: number): Observable<void> {
    return this.groupService.deleteGroup(id);
  }

  searchGroups(): void {
    this.isLoadingGroups.set(true);

    this.groupService
      .searchGroups(this._searchTerm())
      .pipe(
        take(1),
        finalize(() => this.isLoadingGroups.set(false)),
      )
      .subscribe((groups) => {
        this._groups.set(groups);
      });
  }
}
