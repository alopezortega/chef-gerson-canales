import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryComponent } from './gallery';
import { provideTranslateService } from '@ngx-translate/core';

describe('Gallery', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
      providers: [
        provideTranslateService({
          lang: 'es',
          fallbackLang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all gallery items', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const galleryItems = fixture.nativeElement.querySelectorAll('.gallery__item');

    expect(galleryItems.length).toBe(3);
  });
});
