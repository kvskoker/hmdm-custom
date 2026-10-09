import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

const LOADING_CLASS = 'global-loading';

@Injectable()
export class GlobalLoadingService {
  private readonly document = inject(DOCUMENT);

  private counter = signal(0);

  start(): void {
    this.counter.update((v) => v + 1);

    if (this.counter() === 1) {
      this.document.body.classList.add(LOADING_CLASS);
    }
  }

  stop(): void {
    this.counter.update((v) => Math.max(0, v - 1));

    if (this.counter() === 0) {
      this.document.body.classList.remove(LOADING_CLASS);
    }
  }
}
