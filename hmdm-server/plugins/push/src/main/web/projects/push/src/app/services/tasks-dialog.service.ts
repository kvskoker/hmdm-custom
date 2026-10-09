import { inject, Injectable } from '@angular/core';
import { ConfirmDialog, MatDialog } from 'hmdm-ui-kit';
import { filter, switchMap, take } from 'rxjs';
import { TaskDialog } from '../components/task-dialog/task-dialog';
import { TTaskDTO } from '../types/task-dto.type';
import { TasksFacadeService } from './tasks-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TasksDialogService {
  private dialog = inject(MatDialog);
  private tasksFacadeService = inject(TasksFacadeService);

  openNewTaskDialog(): void {
    this.dialog
      .open(TaskDialog, { width: '600px' })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.tasksFacadeService.createTask(data)),
      )
      .subscribe(() => {
        this.tasksFacadeService.searchTasks();
      });
  }

  openDeleteDialog(taskId: number): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          message: 'plugin.push.delete.task',
          confirmButtonText: 'button.delete',
        },
        width: '400px',
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.tasksFacadeService.deleteTask(taskId)),
      )
      .subscribe(() => {
        this.tasksFacadeService.searchTasks();
      });
  }

  openEditDialog(task: TTaskDTO): void {
    this.dialog
      .open(TaskDialog, {
        data: task,
        width: '600px',
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((data) => this.tasksFacadeService.updateTask({ ...task, ...data })),
      )
      .subscribe(() => {
        this.tasksFacadeService.searchTasks();
      });
  }
}
