import {
  afterNextRender,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
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
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly showBrandIntro = signal(true);

  constructor() {
    if (
      isPlatformBrowser(this.platformId) &&
      hasPlayedHomeBrandIntro
    ) {
      this.showBrandIntro.set(false);
    }

    afterNextRender(() => {
      this.initializeBrandIntro();
    });
  }

  protected finishBrandIntro(): void {
    this.showBrandIntro.set(false);
  }

  private initializeBrandIntro(): void {
    if (hasPlayedHomeBrandIntro) {
      this.showBrandIntro.set(false);
      return;
    }

    if (typeof window.matchMedia !== "function") {
      this.showBrandIntro.set(false);
      return;
    }

    const isMobile = window.matchMedia(
      "(max-width: 47.999rem)",
    ).matches;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!isMobile || prefersReducedMotion) {
      this.showBrandIntro.set(false);
      return;
    }

    hasPlayedHomeBrandIntro = true;
  }
}
