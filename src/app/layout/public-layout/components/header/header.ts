import { NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

import { HeaderNavbarComponent } from "./components/header-navbar/header-navbar";

@Component({
  selector: "app-header",
  imports: [
    RouterLink,
    HeaderNavbarComponent,
    NgOptimizedImage,
  ],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
})
export class HeaderComponent {}
