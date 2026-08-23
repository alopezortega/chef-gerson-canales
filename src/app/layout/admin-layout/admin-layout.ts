import { Component, inject, signal } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";

import { AuthService } from "../../core/services/auth.service";
import { ScrollToTop } from "../../shared/components/scroll-to-top/scroll-to-top";

@Component({
  selector: "admin-layout",
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    ScrollToTop,
  ],
  templateUrl: "./admin-layout.html",
  styleUrl: "./admin-layout.scss",
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly isSigningOutState = signal<boolean>(false);
  protected readonly isSigningOut = this.isSigningOutState.asReadonly();

  protected async signOut(): Promise<void> {
    this.isSigningOutState.set(true);

    try {
      await this.authService.signOut();
      await this.router.navigateByUrl("/admin/login");
    } catch (error) {
      console.error("Unable to sign out:", error);
    } finally {
      this.isSigningOutState.set(false);
    }
  }
}
