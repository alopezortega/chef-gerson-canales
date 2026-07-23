import { Component } from '@angular/core';
import { HeaderNavbarComponent } from './components/header-navbar/header-navbar';

@Component({
  selector: 'app-header',
  imports: [HeaderNavbarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {}
