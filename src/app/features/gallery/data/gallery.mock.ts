import { GalleryItem } from '../models/gallery-item.model';

export const GALLERY_MOCK: GalleryItem[] = [
  {
    id: 'private-dinner',
    imageUrl: '/images/gallery/private-dinner.jpg',
    titleKey: 'gallery.items.privateDinner.title',
    altKey: 'gallery.items.privateDinner.alt',
  },
  {
    id: 'private-event',
    imageUrl: '/images/gallery/private-event.jpg',
    titleKey: 'gallery.items.privateEvent.title',
    altKey: 'gallery.items.privateEvent.alt',
  },
  {
    id: 'cooking-workshop',
    imageUrl: '/images/gallery/cooking-workshop.jpg',
    titleKey: 'gallery.items.cookingWorkshop.title',
    altKey: 'gallery.items.cookingWorkshop.alt',
  },
];
