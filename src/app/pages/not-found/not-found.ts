import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-not-found",
  imports: [RouterLink, TranslatePipe],
  templateUrl: "./not-found.html",
  styleUrl: "./not-found.scss",
})
export class NotFound {
}
