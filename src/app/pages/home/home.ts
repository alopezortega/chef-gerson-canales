import { afterNextRender, Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";

import { FinalCta } from "../../shared/components/final-cta/final-cta";

let hasPlayedHomeBrandIntro = false;

@Component({
  selector: "app-home",
  imports: [RouterLink, TranslatePipe, FinalCta],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
})
export class HomeComponent {
  protected readonly showBrandIntro = signal(false);

  constructor() {
    afterNextRender(() => {
      this.initializeBrandIntro();
    });
  }

  private initializeBrandIntro(): void {
    if (hasPlayedHomeBrandIntro) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 47.999rem)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!isMobile || prefersReducedMotion) {
      return;
    }

    hasPlayedHomeBrandIntro = true;
    this.showBrandIntro.set(true);
  }
}
