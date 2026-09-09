import { Component } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-cookies",
  imports: [TranslatePipe],
  templateUrl: "./cookies.html",
  styleUrl: "./cookies.scss",
})
export class CookiesComponent {}
