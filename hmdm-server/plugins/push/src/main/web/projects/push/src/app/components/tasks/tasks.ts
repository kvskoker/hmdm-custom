import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BaseComponent,
  LoaderDirective,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatIconModule,
  MatTabsModule,
  SearchContainer,
  TranslatePipe,
} from 'hmdm-ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TasksDialogService } from '../../services/tasks-dialog.service';
import { TasksFacadeService } from '../../services/tasks-facade.service';
import { TasksTable } from '../tasks-table/tasks-table';

@Component({
  selector: 'push-tasks',
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
  imports: [
    LoaderDirective,
    MatCardModule,
    SearchContainer,
    TasksTable,
    ReactiveFormsModule,
    TranslatePipe,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
  ],
})
export class Tasks extends BaseComponent implements OnInit {
  @ViewChild('table') table!: TasksTable;

  private readonly tasksFacadeService = inject(TasksFacadeService);
  private readonly tasksDialogService = inject(TasksDialogService);

  tableSearchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  isLoadingTasks = this.tasksFacadeService.isLoadingTasks;

  ngOnInit(): void {
    this.tableSearchControl.valueChanges
      .pipe(this.untilDestroyed(), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.table.resetPagination();
        this.tasksFacadeService.setSearchTerm(this.tableSearchControl.value);
      });
  }

  onNewTaskClick(): void {
    this.tasksDialogService.openNewTaskDialog();
  }
}
