import { Component } from '@angular/core';
import { HeaderNavbarComponent } from './components/header-navbar/header-navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, HeaderNavbarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {}
