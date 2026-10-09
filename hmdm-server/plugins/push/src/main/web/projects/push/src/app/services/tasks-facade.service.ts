import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { PageEvent } from 'hmdm-ui-kit';
import { finalize, Observable, take } from 'rxjs';
import { TMessageDTO } from '../types/message-dto.type';
import { TSearchMessageRequest } from '../types/search-message-request.type';
import { TSearchMessagesFormValue } from '../types/search-messages-form.type';
import { TTaskFormValue } from '../types/task-form.type';
import { TasksService } from './tasks.service';
import { TSearchTasksRequest } from '../types/search-tasks-request.type';
import { TTaskDTO } from '../types/task-dto.type';

@Injectable({
  providedIn: 'root',
})
export class TasksFacadeService {
  private readonly taskService = inject(TasksService);
  private readonly _tasks: WritableSignal<TTaskDTO[]> = signal([]);
  private readonly _totalItemsCount: WritableSignal<number> = signal(0);

  private searchTerm: string = '';
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };

  readonly isLoadingTasks: WritableSignal<boolean> = signal(false);
  readonly tasks: Signal<TTaskDTO[]> = this._tasks.asReadonly();
  readonly totalItemsCount: Signal<number> = this._totalItemsCount.asReadonly();

  constructor() {
    this.searchTasks();
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchTasks();
  }

  searchTasks(): void {
    this.isLoadingTasks.set(true);

    const body: TSearchTasksRequest = {
      messageFilter: this.searchTerm || '',
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      sortValue: 'date_desc',
    };

    this.taskService
      .search(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingTasks.set(false)),
      )
      .subscribe((response) => {
        this._tasks.set(response.items);
        this._totalItemsCount.set(response.totalItemsCount);
      });
  }

  createTask(body: TTaskFormValue): Observable<void> {
    this.isLoadingTasks.set(true);
    return this.taskService.create(body);
  }

  deleteTask(taskId: number): Observable<void> {
    this.isLoadingTasks.set(true);
    return this.taskService.delete(taskId);
  }

  updateTask(task: TTaskDTO): Observable<void> {
    this.isLoadingTasks.set(true);
    return this.taskService.update(task);
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchTasks();
  }
}
