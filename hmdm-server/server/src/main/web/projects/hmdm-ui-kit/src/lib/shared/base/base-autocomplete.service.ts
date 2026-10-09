import { HttpClient } from '@angular/common/http';
import { inject, Signal, signal, WritableSignal } from '@angular/core';
import { map, Observable, take } from 'rxjs';
import { THttpResponse } from '../types';
import { TOption } from '../types/option.type';

export abstract class BaseAutocompleteService<R> {
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly _options: WritableSignal<TOption<unknown>[]> = signal([]);

  options: Signal<TOption<unknown>[]> = this._options.asReadonly();

  constructor(
    protected url: string,
    protected opts: {
      valueParam: keyof R | '';
      labelParam: keyof R;
    },
  ) {}

  search(term: string): void {
    this.fetchOptions(term)
      .pipe(
        take(1),
        map((res) => this.mapOptions(res)),
      )
      .subscribe((response) => {
        this._options.set(response);
      });
  }

  //Can be overriden for custom behaviour
  protected mapOptions(response: R[]): TOption<unknown>[] {
    return response.map((obj) => ({
      value: this.opts.valueParam ? obj[this.opts.valueParam] : obj,
      viewValue: String(obj[this.opts.labelParam]),
    }));
  }

  protected fetchOptions(term: string): Observable<R[]> {
    return this.http.post<THttpResponse<R[]>>(this.url, term).pipe(map((res) => res.data));
  }
}
