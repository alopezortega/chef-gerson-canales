import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./layout/public-layout/layout.routes").then(
        (routes) => routes.LAYOUT_ROUTES,
      ),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./layout/admin-layout/admin-layout.routes").then(
        (routes) => routes.ADMIN_LAYOUT_ROUTES,
      ),
  },
];
