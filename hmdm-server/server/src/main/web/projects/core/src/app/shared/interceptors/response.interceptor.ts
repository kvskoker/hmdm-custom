import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStateService } from '../services/auth-state.service';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStateService = inject(AuthStateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        console.log('responseInterceptor: 403 Forbidden - redirecting to sign-in');

        // Remove hsid cookie
        document.cookie = 'hsid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        authStateService.isAuthenticated.next(false);

        // Don't redirect if already on an auth page (e.g. reset-password, sign-in)
        console.log(globalThis.location.pathname);

        if (!globalThis.location.pathname.startsWith('/auth/')) {
          console.log('responseInterceptor: Not on an auth page, redirecting to sign-in');

          const returnUrl = globalThis.location.pathname + globalThis.location.search;
          router.navigate(['/auth/sign-in'], { queryParams: { returnUrl } });
        }
      }

      return throwError(() => error);
    }),
  );
};
