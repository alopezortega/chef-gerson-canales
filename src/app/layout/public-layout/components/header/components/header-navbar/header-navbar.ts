import { Component, computed, inject, signal } from '@angular/core';
import { NavigationItem } from './models/navigation-item';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SocialLinkItem } from './models/social-link-item';
import { filter } from 'rxjs';
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

  protected readonly menuOpen = signal(false);

  // Inject the router to listen for navigation events.
  // When the parent logo is clicked and navigation completes,
  // the navbar menu should close automatically.
  private readonly router = inject(Router);

  /**
   * Subscribe to router events and close the mobile menu when
   * navigation ends. This avoids leaving the navbar open after
   * navigation from a header link or logo click.
   */
  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
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
}
