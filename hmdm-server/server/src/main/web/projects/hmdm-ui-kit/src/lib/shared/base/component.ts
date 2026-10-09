import { Injectable, OnDestroy } from '@angular/core';
import { MonoTypeOperatorFunction, Subject, takeUntil } from 'rxjs';

@Injectable()
export abstract class BaseComponent implements OnDestroy {
  $destroyRef = new Subject<void>();

  ngOnDestroy(): void {
    this.$destroyRef.next();
    this.$destroyRef.complete();
  }

  untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntil<T>(this.$destroyRef);
  }
}
