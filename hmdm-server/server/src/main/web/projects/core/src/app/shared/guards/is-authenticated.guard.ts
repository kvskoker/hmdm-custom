import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  if (authStateService.pendingPasswordReset.getValue()) {
    return router.createUrlTree(['/auth/reset-password']);
  }

  return authStateService.isAuthenticated;
};
