import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_LAYOUT_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../../pages/admin-login/admin-login').then((component) => component.AdminLogin),
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../pages/admin-dashboard/admin-dashboard').then(
            (component) => component.AdminDashboard,
          ),
      },
    ],
  },
];
