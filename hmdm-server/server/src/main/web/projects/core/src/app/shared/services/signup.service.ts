import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { THttpResponse } from '../types/http-response.type';

export type TSignupEmailRequest = {
  email: string;
  language: string;
};

export type TSignupCompleteRequest = {
  token: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  description: string;
  passwd: string;
};

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private readonly http = inject(HttpClient);

  verifyEmail(request: TSignupEmailRequest): Observable<THttpResponse<void>> {
    return this.http
      .post<THttpResponse<void>>('rest/public/signup/verifyEmail', request)
      .pipe(take(1));
  }

  verifyToken(token: string): Observable<THttpResponse<void>> {
    return this.http
      .get<THttpResponse<void>>(`rest/public/signup/verifyToken/${token}`)
      .pipe(take(1));
  }

  complete(request: TSignupCompleteRequest): Observable<THttpResponse<void>> {
    return this.http
      .post<THttpResponse<void>>('rest/public/signup/complete', request)
      .pipe(take(1));
  }
}
