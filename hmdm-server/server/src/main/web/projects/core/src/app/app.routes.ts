import { Routes } from '@angular/router';
import { SignIn } from './auth/pages/sign-in/sign-in';
import { IndexAuth } from './auth';
import { isAuthenticatedGuard } from './shared/guards/is-authenticated.guard';
import { isAnonymousGuard } from './shared/guards/is-anonymous.guard';
import { passwordResetRequiredGuard } from './shared/guards/password-reset-required.guard';
import { isSuperAdminGuard } from './shared/guards/is-super-admin.guard';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { isLicensesAvailableGuard } from './shared/guards/is-licenses-available.guard';
import { isPluginValidGuard } from './shared/guards/is-plugin-valid.guard';
import { unsavedConfigurationGuard } from './shared/guards/unsaved-configuration.guard';
import { fleetPermissionGuard } from './fleet/fleet-permission.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'auth',
    component: IndexAuth,
    canActivateChild: [isAnonymousGuard],
    children: [
      { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
      { path: 'sign-in', component: SignIn },
      {
        path: 'missing-license',
        loadComponent: () =>
          import('./auth/components/license-dialog/license-dialog').then((m) => m.LicenseDialog),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./auth/pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        canActivate: [passwordResetRequiredGuard],
        loadComponent: () =>
          import('./auth/pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/pages/sign-up/sign-up').then((m) => m.SignUp),
      },
      {
        path: 'sign-up-complete',
        loadComponent: () =>
          import('./auth/pages/sign-up-complete/sign-up-complete').then((m) => m.SignUpComplete),
      },
    ],
  },
  {
    path: 'home',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () => import('./main').then((m) => m.IndexMain),
    children: [
      { path: 'fleet/management', canActivate: [fleetPermissionGuard('plugin_devicereset_access')], loadComponent: () => import('./fleet/device-management').then(m => m.DeviceManagement) },
      { path: 'fleet/tracking', canActivate: [fleetPermissionGuard('plugin_devicelocation_access')], loadComponent: () => import('./fleet/device-tracking').then(m => m.DeviceTracking) },
      { path: 'fleet/enrollment', canActivate: [fleetPermissionGuard('plugin_deviceenroll_access')], loadComponent: () => import('./fleet/device-enrollment').then(m => m.DeviceEnrollment) },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'devices',
      },
      {
        path: 'licenses',
        canActivate: [isLicensesAvailableGuard],
        loadComponent: () => import('./licenses/pages/licenses/licenses').then((m) => m.Licenses),
      },
      {
        path: 'updates',
        canActivate: [isLicensesAvailableGuard],
        loadComponent: () => import('./updates/pages/updates/updates').then((m) => m.Updates),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'profile',
        loadComponent: () => import('./auth/pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'devices',
        loadComponent: () => import('./devices/pages/devices/devices').then((m) => m.Devices),
      },
      {
        path: 'files',
        loadComponent: () => import('./files/pages/files/files').then((m) => m.Files),
      },
      {
        path: 'alerts',
        loadComponent: () => import('./alerts/pages/alerts/alerts').then((m) => m.Alerts),
      },

      {
        path: 'applications',
        loadComponent: () =>
          import('./applications/pages/applications/applications').then((m) => m.Applications),
      },
      {
        path: 'applications/:applicationId/versions',
        loadComponent: () =>
          import('./applications/pages/versions/versions').then((m) => m.Versions),
      },

      {
        path: 'configurations',
        loadComponent: () =>
          import('./configurations/pages/configurations/configurations').then(
            (m) => m.Configurations,
          ),
      },
      {
        path: 'configurations/details',
        loadComponent: () =>
          import('./configurations/pages/configuration-details/configuration-details').then(
            (m) => m.ConfigurationDetails,
          ),
        canDeactivate: [unsavedConfigurationGuard],
      },
      {
        path: 'configurations/details/:configurationId',
        loadComponent: () =>
          import('./configurations/pages/configuration-details/configuration-details').then(
            (m) => m.ConfigurationDetails,
          ),
        canDeactivate: [unsavedConfigurationGuard],
      },

      {
        path: 'settings/roles',
        loadComponent: () => import('./settings/pages/roles/roles').then((m) => m.Roles),
      },
      {
        path: 'settings/users',
        loadComponent: () => import('./settings/pages/users/users').then((m) => m.Users),
      },
      {
        path: 'settings/icons',
        loadComponent: () => import('./settings/pages/icons/icons').then((m) => m.Icons),
      },
      {
        path: 'settings/groups',
        loadComponent: () => import('./settings/pages/groups/groups').then((m) => m.Groups),
      },
      {
        path: 'settings/general',
        loadComponent: () =>
          import('./settings/pages/general-settings/general-settings').then(
            (m) => m.GeneralSettings,
          ),
      },
      {
        path: 'settings/devices',
        loadComponent: () =>
          import('./settings/pages/devices-table/devices-table').then((m) => m.DevicesTable),
      },
      ...(window as any).__DYNPLUGINS__?.map((route: any) => ({
        canActivate: [isPluginValidGuard(route.identifier)],
        path: route.path,
        loadChildren: () =>
          loadRemoteModule(route.identifier, `./routes`).then((m) => m.MFE_ROUTES),
      })),
    ],
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'control-panel',
    canActivate: [isAuthenticatedGuard, isSuperAdminGuard],
    loadComponent: () => import('./control-panel').then((m) => m.ControlPanelIndex),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./control-panel/pages/control-panel/control-panel').then((m) => m.ControlPanel),
      },
    ],
  },
];
