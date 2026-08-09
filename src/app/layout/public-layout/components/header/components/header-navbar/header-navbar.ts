import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { filter, fromEvent } from "rxjs";

import { SupportedLanguage } from "../../../../../../core/models/supported-language.type";
import { LanguageService } from "../../../../../../core/services/language.service";

@Component({
  selector: "app-header-navbar",
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: "./header-navbar.html",
  styleUrl: "./header-navbar.scss",
})
export class HeaderNavbarComponent {
  private readonly menuButton = viewChild.required<
    ElementRef<HTMLButtonElement>
  >("menuButton");

  private readonly languageButton = viewChild.required<
    ElementRef<HTMLButtonElement>
  >("languageButton");

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);

  protected readonly menuOpen = signal(false);

  protected readonly menuRendered = signal(false);

  protected readonly menuClosing = signal(false);

  protected readonly languageOpen = signal(false);

  protected readonly currentLanguage = this.languageService.currentLanguage;

  protected readonly menuButtonLabelKey = computed(() =>
    this.menuOpen() ? "navigation.menu.close" : "navigation.menu.open"
  );

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeMenu();
        this.closeLanguageMenu();
      });

    afterNextRender(() => {
      fromEvent<KeyboardEvent>(document, "keydown")
        .pipe(
          filter((event) => event.key === "Escape"),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => this.handleEscapeKey());
    });
  }

  protected toggleMenu(): void {
    this.closeLanguageMenu();

    if (this.menuOpen()) {
      this.closeMenu();

      return;
    }

    this.menuClosing.set(false);
    this.menuRendered.set(true);
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    if (!this.menuRendered() || this.menuClosing()) {
      return;
    }

    this.menuOpen.set(false);
    this.menuClosing.set(true);

    window.setTimeout(() => {
      this.menuRendered.set(false);
      this.menuClosing.set(false);
    }, 220);
  }

  protected toggleLanguageMenu(): void {
    this.closeMenu();

    this.languageOpen.update((isOpen) => !isOpen);
  }

  protected closeLanguageMenu(): void {
    this.languageOpen.set(false);
  }

  protected selectLanguage(language: SupportedLanguage): void {
    this.languageService.changeLanguage(language);
    this.closeLanguageMenu();
  }

  protected handleEscapeKey(): void {
    if (this.languageOpen()) {
      this.closeLanguageMenu();
      this.languageButton().nativeElement.focus();

      return;
    }

    if (this.menuOpen()) {
      this.closeMenu();
      this.menuButton().nativeElement.focus();
    }
  }
}
