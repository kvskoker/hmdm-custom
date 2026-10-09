import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import {LicenseService} from '../../auth/services/license.service';
import {AuthService} from '../services/auth.service';

export function isPluginValidGuard(identifier: string): CanActivateFn {
  return (route, state) => {
    const licenseService = inject(LicenseService);
    const router = inject(Router);
    const authService = inject(AuthService);

    return licenseService.getValidPluginLicenses().pipe(
      map(licenses => {
        if (identifier === 'twofactor' && !authService.hasPermission('twofactor_config')) {
          return router.createUrlTree(['/home/devices']);
        }

        return licenses[identifier] ? true : router.createUrlTree(['/home/licenses']);
      })
    );
  }
}
