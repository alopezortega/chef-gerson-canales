import { NgOptimizedImage } from "@angular/common";
import { Component } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";

import { FinalCta } from "../../shared/components/final-cta/final-cta";

@Component({
  selector: "app-about",
  imports: [TranslatePipe, FinalCta, NgOptimizedImage],
  templateUrl: "./about.html",
  styleUrl: "./about.scss",
})
export class AboutComponent {}
