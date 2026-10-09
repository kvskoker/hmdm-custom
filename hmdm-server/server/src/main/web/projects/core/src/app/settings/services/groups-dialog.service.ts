import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, switchMap, take } from 'rxjs';
import { TGroupDTO } from '../../entity/group/types/group-dto.type';
import { GroupsDialog } from '../components/groups-dialog/groups-dialog';
import { GroupFacadeService } from './group-facade.service';

@Injectable({
  providedIn: 'root',
})
export class GroupsDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly groupFacadeService: GroupFacadeService = inject(GroupFacadeService);

  openAddGroup(): void {
    this.dialog
      .open(GroupsDialog, { width: '600px' })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((roleData) => this.groupFacadeService.createGroup(roleData)),
      )
      .subscribe(() => this.groupFacadeService.searchGroups());
  }

  openEditGroup(group: TGroupDTO): void {
    this.dialog
      .open(GroupsDialog, {
        width: '600px',
        data: { group },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((groupData) => this.groupFacadeService.updateGroup({ ...group, ...groupData })),
      )
      .subscribe(() => this.groupFacadeService.searchGroups());
  }

  openDeleteGroup(group: TGroupDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'question.delete.group',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: { groupName: group.name },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.groupFacadeService.deleteGroup(group.id)),
      )
      .subscribe(() => this.groupFacadeService.searchGroups());
  }
}
