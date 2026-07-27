import { Injectable, signal } from '@angular/core';

import { GALLERY_MOCK } from '../data/gallery.mock';
import { GalleryItem } from '../models/gallery-item.model';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private readonly galleryItemsSignal = signal<GalleryItem[]>(GALLERY_MOCK);

  readonly galleryItems = this.galleryItemsSignal.asReadonly();
}
