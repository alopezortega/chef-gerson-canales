import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, fromEvent } from 'rxjs';
import { LanguageService } from '../../../../../../core/services/language.service';
import { SupportedLanguage } from '../../../../../../core/models/supported-language.type';

@Component({
  selector: 'app-header-navbar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header-navbar.html',
  styleUrl: './header-navbar.scss',
})
export class HeaderNavbarComponent {
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  protected readonly menuOpen = signal(false);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);

  protected readonly menuButtonLabelKey = computed(() =>
    this.menuOpen() ? 'navigation.menu.close' : 'navigation.menu.open',
  );

  constructor() {
    /**
     * When the parent logo is clicked and navigation completes,
     * the navbar menu should close automatically.
     * Subscribe to router events and close the mobile menu when
     * navigation ends. This avoids leaving the navbar open after
     * navigation from a header link or logo click.
     */

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());

    afterNextRender(() => {
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          filter((event) => event.key === 'Escape'),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => this.handleEscapeKey());
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected handleEscapeKey(): void {
    if (!this.menuOpen()) {
      return;
    }

    this.menuButton().nativeElement.focus();
    this.closeMenu();
  }

  protected readonly currentLanguage = this.languageService.currentLanguage;

  protected changeLanguage(language: SupportedLanguage): void {
    this.languageService.changeLanguage(language);
  }
}
