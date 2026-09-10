import { CanDeactivateFn } from "@angular/router";
import { QuoteRequestComponent } from "./quote-request";

export const quoteRequestPendingChangesGuard: CanDeactivateFn<
  QuoteRequestComponent
> = (component) => component.canDeactivate();
