import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AuthStateService} from '../services/auth-state.service';
import {filter, map, take} from 'rxjs';

export const isLicensesAvailableGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  return authStateService.isAuthenticated.pipe(
    filter(Boolean),
    take(1),
    map(() => (
      authService.currentUser()?.superAdmin ||
      (authService.currentUser()?.singleCustomer && authService.hasPermission('settings')) ?
      true :
      router.createUrlTree(['/home'])
    )),
  );
};
