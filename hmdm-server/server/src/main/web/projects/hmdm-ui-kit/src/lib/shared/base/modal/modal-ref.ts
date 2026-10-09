import { Type } from '@angular/core';
import { TModalResult } from 'app/shared/base/modal/modal-result.type';
import { nanoid } from 'nanoid';
import { Observable, Subject } from 'rxjs';

export class ModalRef<T> {
  id: string;
  data: any;
  modalType: Type<any> | null = null;

  constructor() {
    this.id = nanoid();
  }

  private result = new Subject<TModalResult<T>>();

  close(result?: T): void {
    this.result.next({ id: this.id, data: result ?? null });
    this.result.complete();
  }

  afterClosed(): Observable<TModalResult<T>> {
    return this.result.asObservable();
  }
}
