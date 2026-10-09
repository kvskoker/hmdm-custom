import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { FileDownloadService, PageEvent } from 'hmdm-ui-kit';
import { finalize, take } from 'rxjs';
import { TLogsDTO } from '../types/logs-dto.type';
import { TSearchLogsFormValue } from '../types/search-logs-form.type';
import { TSearchRequestBody } from '../types/search-logs-request.type';
import { LogsService } from './logs.service';

@Injectable({
  providedIn: 'root',
})
export class LogsFacadeService {
  private readonly logsService = inject(LogsService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly _logs: WritableSignal<TLogsDTO[]> = signal([]);
  private readonly _totalItemsCount: WritableSignal<number> = signal(0);

  private searchTerm: string = '';
  private formData: TSearchLogsFormValue | null = null;
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private lastRequestBody: TSearchRequestBody | null = null;

  readonly isLoadingMessages: WritableSignal<boolean> = signal(false);
  readonly isUpdatingSilently: WritableSignal<boolean> = signal(false);
  readonly logs: Signal<TLogsDTO[]> = this._logs.asReadonly();
  readonly totalItemsCount: Signal<number> = this._totalItemsCount.asReadonly();

  constructor() {
    this.searchLogs();
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchLogs();
  }

  setFormData(formData: TSearchLogsFormValue): void {
    this.formData = formData;
    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchLogs();
  }

  searchLogs(): void {
    this.isLoadingMessages.set(true);

    const body = this.getRequestBody();

    this.lastRequestBody = body;

    this.logsService
      .search(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingMessages.set(false)),
      )
      .subscribe((response) => {
        this._logs.set(response.items);
        this._totalItemsCount.set(response.totalItemsCount);
      });
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchLogs();
  }

  silentUpdateLogs(): void {
    const body = this.lastRequestBody ?? this.getRequestBody();

    this.isUpdatingSilently.set(true);

    this.logsService
      .search(body)
      .pipe(
        take(1),
        finalize(() => this.isUpdatingSilently.set(false)),
      )
      .subscribe((response) => {
        this._logs.set(response.items);
        this._totalItemsCount.set(response.totalItemsCount);
      });
  }

  exportLogs(): void {
    const body = this.getRequestBody();

    this.logsService
      .export(body)
      .pipe(take(1))
      .subscribe((content) => {
        this.fileDownloadService.downloadTextFile('logs.txt', content);
      });
  }

  private getRequestBody(): TSearchRequestBody {
    const body: TSearchRequestBody = {
      dateFrom: this.formData?.dateRange?.start || null,
      dateTo: this.formData?.dateRange?.end || null,
      applicationFilter: this.formData?.applicationFilter || '',
      deviceFilter: this.formData?.deviceFilter || '',
      messageFilter: this.searchTerm || '',
      severity: this.formData?.severity || 0,
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      sortValue: 'createTime',
    };

    return body;
  }
}
