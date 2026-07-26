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
import { NavigationItem } from './models/navigation-item';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SocialLinkItem } from './models/social-link-item';
import { filter, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-navbar.html',
  styleUrl: './header-navbar.scss',
})
export class HeaderNavbarComponent {
  protected readonly navigationItems: NavigationItem[] = [
    {
      label: 'Servicios',
      route: '/servicios',
    },
    {
      label: 'Galería',
      route: '/galeria',
    },
    {
      label: 'Solicitar presupuesto',
      route: '/solicitar-presupuesto',
      isCta: true,
    },
    {
      label: 'Sobre el Chef',
      route: '/sobre-el-chef',
    },
  ];

  protected readonly socialLinks: SocialLinkItem[] = [
    {
      ariaLabel: 'Visitar el Instagram de Gerson Canales',
      url: 'https://www.instagram.com/gersontravel.chef/',
      icon: 'instagram',
    },
  ];
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');
  protected readonly menuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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

  protected readonly menuButtonLabel = computed(() =>
    this.menuOpen() ? 'Cerrar menú' : 'Abrir menú',
  );

  // Close the mobile menu and return focus to the menu button when Escape is pressed.
  protected handleEscapeKey(): void {
    if (!this.menuOpen()) {
      return;
    }

    this.menuButton().nativeElement.focus();
    this.closeMenu();
  }
}
