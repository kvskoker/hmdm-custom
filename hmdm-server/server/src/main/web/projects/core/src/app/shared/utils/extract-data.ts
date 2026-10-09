import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { THttpResponse } from '../types/http-response.type';

export function extractData<T>(): (source: Observable<THttpResponse<T>>) => Observable<T> {
  return (source: Observable<THttpResponse<T>>) => source.pipe(map((response) => response.data));
}
