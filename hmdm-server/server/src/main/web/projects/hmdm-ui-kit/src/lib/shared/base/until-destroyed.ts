import { BaseComponent } from 'app/shared/base/component';
import { MonoTypeOperatorFunction, takeUntil } from 'rxjs';

export function untilDestroyed<T>(component: BaseComponent): MonoTypeOperatorFunction<T> {
  return takeUntil(component.$destroyRef);
}
