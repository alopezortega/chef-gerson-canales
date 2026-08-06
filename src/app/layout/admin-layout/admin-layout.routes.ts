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
      {
        path: 'quote-requests/:id',
        loadComponent: () =>
          import('../../pages/admin-quote-request-detail/admin-quote-request-detail').then(
            (component) => component.AdminQuoteRequestDetail,
          ),
      },
      {
        path: 'service-document',
        loadComponent: () =>
          import('../../pages/admin-service-document/admin-service-document').then(
            (component) => component.AdminServiceDocument,
          ),
      },
    ],
  },
];
