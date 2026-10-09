import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

export const passwordResetRequiredGuard: CanActivateFn = (route) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const hasPendingReset = authStateService.pendingPasswordReset.getValue() !== null;
  const hasToken = !!route.queryParamMap.get('token');
  const isSignUp = route.routeConfig?.path === 'auth/sign-up-complete';

  return hasPendingReset || hasToken || isSignUp ? true : router.createUrlTree(['/auth/sign-in']);
};
