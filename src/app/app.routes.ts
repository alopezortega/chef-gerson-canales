import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./layout/public-layout/layout.routes').then((routes) => routes.LAYOUT_ROUTES),
  },
];
