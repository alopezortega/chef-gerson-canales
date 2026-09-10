import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-final-cta",
  imports: [RouterLink, TranslatePipe],
  templateUrl: "./final-cta.html",
  styleUrl: "./final-cta.scss",
})
export class FinalCta {}
