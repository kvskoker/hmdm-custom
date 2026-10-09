import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';
import { filter, map, take } from 'rxjs';

export const isSuperAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  return authStateService.isAuthenticated.pipe(
    filter(Boolean),
    take(1),
    map(() => (authService.currentUser()?.superAdmin ? true : router.createUrlTree(['/home']))),
  );
};
