import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { FooterComponent } from "./components/footer/footer";
import { HeaderComponent } from "./components/header/header";
import { ScrollToTop } from "../../shared/components/scroll-to-top/scroll-to-top";

@Component({
  selector: "app-public-layout",
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ScrollToTop,
  ],
  templateUrl: "./public-layout.html",
  styleUrl: "./public-layout.scss",
})
export class PublicLayout {}
