import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { GalleryService } from '../../features/gallery/services/gallery.service';

@Component({
  selector: 'app-gallery',
  imports: [TranslatePipe],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);

  protected readonly galleryItems = this.galleryService.galleryItems;
}
