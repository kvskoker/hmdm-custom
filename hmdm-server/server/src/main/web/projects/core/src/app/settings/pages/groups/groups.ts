import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, LoaderDirective, SearchContainer } from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GroupsTable } from '../../components/groups-table/groups-table';
import { GroupFacadeService } from '../../services/group-facade.service';
import { GroupsDialogService } from '../../services/groups-dialog.service';

@Component({
  selector: 'core-groups',
  templateUrl: './groups.html',
  styleUrl: './groups.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    TranslatePipe,
    LoaderDirective,
    SearchContainer,
    MatIconModule,
    MatDividerModule,
    GroupsTable,
  ],
})
export class Groups extends BaseComponent implements OnInit {
  private readonly groupsFacadeService = inject(GroupFacadeService);
  private readonly groupsDialogService = inject(GroupsDialogService);

  isLoadingGroups = this.groupsFacadeService.isLoadingGroups;
  groupsSearchControl = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    this.groupsSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), this.untilDestroyed())
      .subscribe(() => {
        this.groupsFacadeService.setSearchTerm(this.groupsSearchControl.value);
      });
  }

  onAddGroup(): void {
    this.groupsDialogService.openAddGroup();
  }
}
