import { Routes } from '@angular/router';
import { App } from './app';

export const MFE_ROUTES: Routes = [
  {
    path: '',
    component: App,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      {
        path: 'main',
        loadComponent: () => import('./pages/info/info').then((m) => m.Info),
      },
      {
        path: 'dynamic/:deviceName',
        loadComponent: () => import('./pages/dynamic/dynamic').then((m) => m.Dynamic),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];
