import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FileDownloadService, PageEvent, TranslateService } from 'hmdm-ui-kit';
import { finalize, take } from 'rxjs';
import { TDetailsDTO } from '../types/details-dto.type';
import { TSearchFormValue } from '../types/search-form.type';
import { DetailsService } from './details.service';
import { TDynamicRequest } from '../types/dynamic-request.type';
import { FieldsSelectionService } from './fields-selection.service';

@Injectable({
  providedIn: 'root',
})
export class DetailsFacadeService {
  private readonly detailsService = inject(DetailsService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly fieldsService = inject(FieldsSelectionService);
  private readonly translateService = inject(TranslateService);
  private readonly _details: WritableSignal<TDetailsDTO | null> = signal(null);
  private readonly _dynamic: WritableSignal<any | null> = signal(null);
  private readonly _dynamicTotalCount: WritableSignal<number> = signal(0);

  private form: TSearchFormValue | null = null;
  private pageData: PageEvent = { pageIndex: 0, pageSize: 50, length: 0 };
  private deviceNumber: string = '';

  readonly isLoadingDetails: WritableSignal<boolean> = signal(false);
  readonly isLoadingDynamic: WritableSignal<boolean> = signal(false);
  readonly details = this._details.asReadonly();
  readonly dynamic = this._dynamic.asReadonly();
  readonly dynamicTotalCount = this._dynamicTotalCount.asReadonly();

  getDetails(deviceNumber: string): void {
    this.isLoadingDetails.set(true);

    this.detailsService
      .getDetails(deviceNumber)
      .pipe(
        take(1),
        finalize(() => this.isLoadingDetails.set(false)),
      )
      .subscribe((details) => this._details.set(details));
  }

  setDeviceNumber(deviceName: string): void {
    this.deviceNumber = deviceName;
    this.searchDynamic();
  }

  setForm(form: TSearchFormValue): void {
    this.form = form;

    this.pageData = { pageIndex: 0, pageSize: this.pageData.pageSize, length: 0 };
    this.searchDynamic();
  }

  updatePage($event: PageEvent): void {
    this.pageData = $event;
    this.searchDynamic();
  }

  exportLogs(): void {
    this.isLoadingDetails.set(true);

    const body = this.getBody();

    const keys = Object.keys(this.fieldsService.fieldsSelection());
    const fields = keys.filter((key) => this.fieldsService.fieldsSelection()[key]);
    this.detailsService
      .export({ ...body, fields, locale: this.translateService.getCurrentLang() })
      .pipe(
        take(1),
        finalize(() => this.isLoadingDetails.set(false)),
      )
      .subscribe((content) => {
        this.fileDownloadService.downloadArrayBuffer(`${body.deviceNumber}.csv`, content);
      });
  }

  clearState(): void {
    this._details.set(null);
    this._dynamic.set(null);
    this._dynamicTotalCount.set(0);
    this.form = null;
    this.pageData = { pageIndex: 0, pageSize: 50, length: 0 };
    this.deviceNumber = '';
  }

  private searchDynamic(): void {
    this.isLoadingDynamic.set(true);

    const body = this.getBody();

    this.detailsService
      .getDynamic(body)
      .pipe(
        take(1),
        finalize(() => this.isLoadingDynamic.set(false)),
      )
      .subscribe((res) => {
        this._dynamic.set(res.items);
        this._dynamicTotalCount.set(res.totalItemsCount);
      });
  }

  private getBody(): TDynamicRequest {
    const dateTo: Date | undefined = this.form?.dateRange?.end;
    if (dateTo instanceof Date && this.form?.timeTo) {
      this.form.dateRange.to = new Date(dateTo);
      const time = this.form?.timeTo;
      const hour = time instanceof Date ? time.getHours().toString() : '0';
      const minute = time instanceof Date ? time.getMinutes().toString() : '0';
      dateTo.setHours(Number(hour), Number(minute), 0, 0);
    }

    const dateFrom = this.form?.dateRange?.start;
    if (dateFrom instanceof Date && this.form?.timeFrom) {
      this.form.dateRange.from = new Date(dateFrom);
      const time = this.form?.timeFrom;
      const hour = time instanceof Date ? time.getHours().toString() : '0';
      const minute = time instanceof Date ? time.getMinutes().toString() : '0';
      dateFrom.setHours(Number(hour), Number(minute), 0, 0);
    }

    const body = {
      dateFrom: dateFrom instanceof Date ? dateFrom?.toISOString() : undefined,
      dateTo: dateTo instanceof Date ? dateTo?.toISOString() : undefined,
      deviceNumber: this.deviceNumber,
      fixedInterval: this.form?.interval || -1,
      pageNum: this.pageData.pageIndex + 1,
      pageSize: this.pageData.pageSize,
      useFixedInterval: this.form?.interval !== -1,
    };

    return body;
  }
}
