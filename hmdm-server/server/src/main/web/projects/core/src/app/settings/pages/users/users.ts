import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatIconModule,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UserTable } from '../../components/user-table/user-table';
import { UsersDialogService } from '../../services/users-dialog.service';
import { UsersFacadeService } from '../../services/users-facade.service';

@Component({
  selector: 'core-users',
  templateUrl: './users.html',
  styleUrl: './users.scss',
  imports: [
    MatCardModule,
    SearchContainer,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    UserTable,
    TranslatePipe,
    LoaderDirective,
  ],
})
export class Users extends BaseComponent implements OnInit {
  private readonly usersDialogService = inject(UsersDialogService);
  private readonly usersFacadeService = inject(UsersFacadeService);

  isLoadingUsers: WritableSignal<boolean> = signal(false);
  usersSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.usersSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.usersFacadeService.updateSearchTerm(this.usersSearchControl.value);
        this.usersFacadeService.searchUsers();
      });

    this.usersFacadeService.searchUsers();
  }

  onAddUserClick(): void {
    this.usersDialogService.openAddUser();
  }
}
