import { Routes } from '@angular/router';
import {App} from './app';

export const MFE_ROUTES: Routes = [
  {
    path: '',
    component: App,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      {
        path: 'main',
        loadComponent: () => import('./pages/xtra/xtra').then((m) => m.Xtra),
      }
    ],
  },
];
