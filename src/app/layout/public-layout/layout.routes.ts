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
      {
        path: "privacidad",
        loadComponent: () =>
          import("../../pages/privacy/privacy").then(
            (component) => component.PrivacyComponent,
          ),
      },
      {
        path: "aviso-legal",
        loadComponent: () =>
          import("../../pages/legal-notice/legal-notice").then(
            (component) => component.LegalNoticeComponent,
          ),
      },
      {
        path: "cookies",
        loadComponent: () =>
          import("../../pages/cookies/cookies").then(
            (component) => component.CookiesComponent,
          ),
      },
      {
        path: "404",
        loadComponent: () =>
          import("../../pages/not-found/not-found").then(
            (component) => component.NotFound,
          ),
      },
    ],
  },
];
