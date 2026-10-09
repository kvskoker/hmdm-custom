import { Component, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { UsersTableConfig } from '../../configuration/users-table.config';
import { UsersFacadeService } from '../../services/users-facade.service';

@Component({
  selector: 'core-user-table',
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
  imports: [Table],
})
export class UserTable {
  private readonly usersTableConfig: UsersTableConfig = inject(UsersTableConfig);
  private readonly usersFacadeService: UsersFacadeService = inject(UsersFacadeService);

  readonly tableConfig = this.usersTableConfig.getConfig();
  readonly data = this.usersFacadeService.users;
}
