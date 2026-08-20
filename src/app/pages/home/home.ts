import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";

import { FinalCta } from "../../shared/components/final-cta/final-cta";

@Component({
  selector: "app-home",
  imports: [RouterLink, TranslatePipe, FinalCta],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
})
export class HomeComponent {}
