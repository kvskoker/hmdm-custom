import { inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { PageEvent } from 'hmdm-ui-kit';
import { TAuditDTO } from '../types/audit-dto.type';
import { TAuditFormValue } from '../types/audit-form.type';
import { TGetAllAuditsRequest } from '../types/get-all-audits-request.type';
import { AuditService } from './audit.service';
import { finalize, take } from 'rxjs';

@Injectable()
export class AuditFacadeService {
  private readonly auditService = inject(AuditService);
  private readonly _tableData: WritableSignal<TAuditDTO[]> = signal([]);
  private _totalItems: WritableSignal<number> = signal(0);
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private formData: TAuditFormValue | null = null;
  private userFilter: string = '';
  private lastRequestBody: TGetAllAuditsRequest | null = null;
  private isInitialized = false;

  isLoadingAudits: WritableSignal<boolean> = signal(false);
  tableData: Signal<TAuditDTO[]> = this._tableData.asReadonly();
  totalItems: Signal<number> = this._totalItems.asReadonly();

  constructor() {}

  initialize(): void {
    this.isInitialized = true;
    this.search();
  }

  search(): void {
    const body = this.getRequestBody();

    const isSameRequest =
      this.lastRequestBody !== null &&
      JSON.stringify(this.lastRequestBody) === JSON.stringify(body);

    if (isSameRequest) {
      return;
    }

    this.lastRequestBody = body;
    this.isLoadingAudits.set(true);

    this.auditService
      .getAllAudits(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingAudits.set(false)),
      )
      .subscribe({
        next: (response) => {
          this._tableData.set(response.data.items || []);
          this._totalItems.set(response.data.totalItemsCount || 0);
        },
        error: (error) => {
          console.error('Error fetching audits:', error);
          this._tableData.set([]);
        },
      });
  }

  updateFormValue(formValue: TAuditFormValue) {
    this.formData = formValue;
    if (this.isInitialized) {
      this.search();
    }
  }

  setUserFilter(value: string): void {
    this.userFilter = value;
    if (this.isInitialized) {
      this.search();
    }
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.search();
  }

  private getRequestBody(): TGetAllAuditsRequest {
    return {
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      messageFilter: this.formData?.messageFilter || '',
      userFilter: this.userFilter,
      dateFrom: this.formData?.date?.start?.toISOString() || null,
      dateTo: this.formData?.date?.end?.toISOString() || null,
    };
  }
}
