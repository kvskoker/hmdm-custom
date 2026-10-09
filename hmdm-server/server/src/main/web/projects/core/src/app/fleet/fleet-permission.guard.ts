import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

export function fleetPermissionGuard(permission: string): CanActivateFn {
  return () => inject(AuthService).hasPermission(permission) || inject(Router).createUrlTree(['/home/devices']);
}
