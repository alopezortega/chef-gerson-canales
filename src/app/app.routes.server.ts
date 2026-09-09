import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  {
    path: "admin/**",
    renderMode: RenderMode.Client,
  },
  {
    path: "",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "servicios",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "galeria",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "solicitar-presupuesto",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "sobre-el-chef",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "404",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "**",
    renderMode: RenderMode.Server,
  },
];
