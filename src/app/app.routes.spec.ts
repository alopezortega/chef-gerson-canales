import { describe, expect, it } from "vitest";

import { NotFound } from "./pages/not-found/not-found";
import { routes } from "./app.routes";
import { LAYOUT_ROUTES } from "./layout/public-layout/layout.routes";

describe("Application routing", () => {
  it("should load NotFound for the /404 public route", async () => {
    const publicLayoutRoute = LAYOUT_ROUTES.find(
      (route) => route.path === "",
    );

    const notFoundRoute = publicLayoutRoute?.children?.find(
      (route) => route.path === "404",
    );

    expect(notFoundRoute).toBeTruthy();
    expect(notFoundRoute?.loadComponent).toBeTruthy();

    const component = await notFoundRoute?.loadComponent?.();

    expect(component).toBe(NotFound);
  });

  it("should redirect unknown routes to /404", () => {
    const wildcardRoute = routes.find(
      (route) => route.path === "**",
    );

    expect(wildcardRoute).toBeTruthy();
    expect(wildcardRoute?.redirectTo).toBe("404");
  });
});
