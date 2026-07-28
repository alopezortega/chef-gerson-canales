import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {}
