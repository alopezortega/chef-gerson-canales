import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import type { ServiceDocument } from '../../features/service-document/models/service-document.model';
import { ServiceDocumentService } from '../../features/service-document/services/service-document.service';
import { ServicesComponent } from './services';

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  const currentDocument = signal<ServiceDocument | null>(null);
  const isLoading = signal(false);

  const serviceDocumentServiceMock = {
    currentDocument,
    isLoading,
    loadCurrentDocument: vi.fn().mockResolvedValue(undefined),
    createDownloadSignedUrl: vi.fn().mockResolvedValue('https://example.com/signed-document'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    currentDocument.set(null);
    isLoading.set(false);

    await TestBed.configureTestingModule({
      imports: [ServicesComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: ServiceDocumentService,
          useValue: serviceDocumentServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the current document on initialization', () => {
    expect(serviceDocumentServiceMock.loadCurrentDocument).toHaveBeenCalledTimes(1);
  });

  it('should not download when there is no current document', async () => {
    await component['downloadServiceDocument']();

    expect(serviceDocumentServiceMock.createDownloadSignedUrl).not.toHaveBeenCalled();
  });

  it('should not start another download while one is already in progress', async () => {
    currentDocument.set({
      id: 'document-id',
      storagePath: 'documents/services.pdf',
      originalName: 'services.pdf',
      mimeType: 'application/pdf',
      size: 1000,
      createdAt: '2026-08-06T10:00:00.000Z',
      updatedAt: '2026-08-06T10:00:00.000Z',
    });

    component['isDownloading'].set(true);

    await component['downloadServiceDocument']();

    expect(serviceDocumentServiceMock.createDownloadSignedUrl).not.toHaveBeenCalled();
  });

  it('should create and open a signed document URL', async () => {
    currentDocument.set({
      id: 'document-id',
      storagePath: 'documents/services.pdf',
      originalName: 'services.pdf',
      mimeType: 'application/pdf',
      size: 1000,
      createdAt: '2026-08-06T10:00:00.000Z',
      updatedAt: '2026-08-06T10:00:00.000Z',
    });

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await component['downloadServiceDocument']();

    expect(serviceDocumentServiceMock.createDownloadSignedUrl).toHaveBeenCalledWith(
      'documents/services.pdf',
    );

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/signed-document',
      '_blank',
      'noopener,noreferrer',
    );

    expect(component['downloadError']()).toBe(false);
    expect(component['isDownloading']()).toBe(false);
  });

  it('should handle an error while preparing the download', async () => {
    currentDocument.set({
      id: 'document-id',
      storagePath: 'documents/services.pdf',
      originalName: 'services.pdf',
      mimeType: 'application/pdf',
      size: 1000,
      createdAt: '2026-08-06T10:00:00.000Z',
      updatedAt: '2026-08-06T10:00:00.000Z',
    });

    serviceDocumentServiceMock.createDownloadSignedUrl.mockRejectedValueOnce(
      new Error('Unable to create signed URL'),
    );

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await component['downloadServiceDocument']();

    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(component['downloadError']()).toBe(true);
    expect(component['isDownloading']()).toBe(false);
  });
});
