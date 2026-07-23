import { Component } from '@angular/core';
import { NavigationItem } from './models/navigation-item';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
    },
    {
      label: 'Sobre el Chef',
      route: '/sobre-el-chef',
    },
  ];
}
