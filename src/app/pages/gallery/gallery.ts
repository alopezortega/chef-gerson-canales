import { Component, inject } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";

import { GalleryService } from "../../features/gallery/services/gallery.service";
import { FinalCta } from "../../shared/components/final-cta/final-cta";

@Component({
  selector: "app-gallery",
  imports: [TranslatePipe, FinalCta],
  templateUrl: "./gallery.html",
  styleUrl: "./gallery.scss",
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);

  protected readonly galleryItems = this.galleryService.galleryItems;
}
