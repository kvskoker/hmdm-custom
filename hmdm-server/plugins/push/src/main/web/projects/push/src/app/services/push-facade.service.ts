import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { PageEvent } from 'hmdm-ui-kit';
import { finalize, Observable, take } from 'rxjs';
import { TMessageDTO } from '../types/message-dto.type';
import { TMessageFormValue } from '../types/message-form.type';
import { TSearchMessageRequest } from '../types/search-message-request.type';
import { TSearchMessagesFormValue } from '../types/search-messages-form.type';
import { PushService } from './push.service';

@Injectable({
  providedIn: 'root',
})
export class PushFacadeService {
  private readonly pushService = inject(PushService);
  private readonly _messages: WritableSignal<TMessageDTO[]> = signal([]);
  private readonly _totalItemsCount: WritableSignal<number> = signal(0);

  private searchTerm: string = '';
  private formData: TSearchMessagesFormValue | null = null;
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };

  readonly isLoadingMessages: WritableSignal<boolean> = signal(false);
  readonly messages: Signal<TMessageDTO[]> = this._messages.asReadonly();
  readonly totalItemsCount: Signal<number> = this._totalItemsCount.asReadonly();

  constructor() {
    this.searchMessages();
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchMessages();
  }

  setFormData(formData: TSearchMessagesFormValue): void {
    this.formData = formData;
    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchMessages();
  }

  searchMessages(): void {
    this.isLoadingMessages.set(true);

    const body: TSearchMessageRequest = {
      dateFrom: this.formData?.dateRange?.start || null,
      dateTo: this.formData?.dateRange?.end || null,
      deviceFilter: this.formData?.deviceFilter || '',
      messageFilter: this.searchTerm || '',
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      sortValue: 'createTime',
    };

    this.pushService
      .search(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingMessages.set(false)),
      )
      .subscribe((response) => {
        this._messages.set(response.items);
        this._totalItemsCount.set(response.totalItemsCount);
      });
  }

  sendMessage(body: TMessageFormValue): Observable<void> {
    this.isLoadingMessages.set(true);
    return this.pushService.pushMessage(body);
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchMessages();
  }
}
