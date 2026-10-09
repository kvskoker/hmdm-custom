import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TasksDialogService } from '../../services/tasks-dialog.service';
import { TTaskDTO } from '../../types/task-dto.type';

@Component({
  selector: 'push-task-actions-cell',
  templateUrl: './task-actions-cell.html',
  styleUrl: './task-actions-cell.scss',
  imports: [MatIconModule, MatButtonModule],
})
export class TaskActionsCell extends BaseCellRenderer<TTaskDTO> {
  private readonly tasksDialogService = inject(TasksDialogService);

  onDeleteClick(): void {
    this.tasksDialogService.openDeleteDialog(this.params().data.id);
  }

  onEditClick(): void {
    this.tasksDialogService.openEditDialog(this.params().data);
  }
}
