import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { THttpPageableResponse, THttpResponse } from 'hmdm-ui-kit';
import { map, Observable } from 'rxjs';
import { TSearchTasksRequest } from '../types/search-tasks-request.type';
import { TTaskDTO } from '../types/task-dto.type';
import { TTaskFormValue } from '../types/task-form.type';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly http: HttpClient = inject(HttpClient);

  search(body: TSearchTasksRequest): Observable<{ items: TTaskDTO[]; totalItemsCount: number }> {
    return this.http
      .post<
        THttpPageableResponse<TTaskDTO>
      >('rest/private/plugin-push/searchTasks', body)
      .pipe(
        map((response) => ({
          items: response.data.items,
          totalItemsCount: response.data.totalItemsCount,
        })),
      );
  }

  create(task: TTaskFormValue): Observable<void> {
    return this.http
      .put<THttpResponse<void>>('rest/private/plugin-push/task', task)
      .pipe(map((response) => response.data));
  }

  delete(taskId: number): Observable<void> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/plugin-push/task/${taskId}`)
      .pipe(map((response) => response.data));
  }

  update(task: TTaskDTO): Observable<void> {
    return this.http
      .put<THttpResponse<void>>(`rest/private/plugin-push/task`, task)
      .pipe(map((response) => response.data));
  }
}
