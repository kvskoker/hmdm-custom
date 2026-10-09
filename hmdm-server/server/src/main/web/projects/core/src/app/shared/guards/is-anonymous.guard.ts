import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';

export const isAnonymousGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  if (authStateService.pendingPasswordReset.getValue()) {
    // Let passwordResetRequiredGuard handle the reset-password route
    if (state.url.includes('reset-password')) {
      return true;
    }
    return router.createUrlTree(['/auth/reset-password']);
  }

  return authStateService.isAuthenticated.pipe(
    map((isAuth) => (!isAuth ? true : router.createUrlTree(['/home']))),
  );
};
