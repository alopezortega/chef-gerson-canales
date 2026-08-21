import { Routes } from "@angular/router";

import { quoteRequestPendingChangesGuard } from "../../pages/quote-request/quote-request-pending-changes.guard";
import { PublicLayout } from "./public-layout";

export const LAYOUT_ROUTES: Routes = [
  {
    path: "",
    component: PublicLayout,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../../pages/home/home").then(
            (component) => component.HomeComponent,
          ),
      },
      {
        path: "servicios",
        loadComponent: () =>
          import("../../pages/services/services").then(
            (component) => component.ServicesComponent,
          ),
      },
      {
        path: "galeria",
        loadComponent: () =>
          import("../../pages/gallery/gallery").then(
            (component) => component.GalleryComponent,
          ),
      },
      {
        path: "solicitar-presupuesto",
        loadComponent: () =>
          import("../../pages/quote-request/quote-request").then(
            (component) => component.QuoteRequestComponent,
          ),
        canDeactivate: [quoteRequestPendingChangesGuard],
      },
      {
        path: "sobre-el-chef",
        loadComponent: () =>
          import("../../pages/about/about").then(
            (component) => component.AboutComponent,
          ),
      },
    ],
  },
];
