import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { SUPABASE_CLIENT } from '../../../core/config/supabase-client.token';
import type { ServiceDocumentRow } from '../models/service-document.model';
import { ServiceDocumentService } from './service-document.service';

describe('ServiceDocumentService', () => {
  let service: ServiceDocumentService;

  const documentRow: ServiceDocumentRow = {
    id: 'document-id',
    storage_path: 'previous-services.pdf',
    original_name: 'services.pdf',
    mime_type: 'application/pdf',
    size: 1000,
    created_at: '2026-08-06T10:00:00.000Z',
    updated_at: '2026-08-06T10:00:00.000Z',
  };

  const updatedDocumentRow: ServiceDocumentRow = {
    ...documentRow,
    storage_path: 'new-services.pdf',
    original_name: 'new services.pdf',
    size: 2000,
    updated_at: '2026-08-06T12:00:00.000Z',
  };

  const fromMock = vi.fn();
  const storageFromMock = vi.fn();

  const supabaseClientMock = {
    from: fromMock,
    storage: {
      from: storageFromMock,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClientMock,
        },
      ],
    });

    service = TestBed.inject(ServiceDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load and map the current document', async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: documentRow,
      error: null,
    });

    const limitMock = vi.fn().mockReturnValue({
      maybeSingle: maybeSingleMock,
    });

    const selectMock = vi.fn().mockReturnValue({
      limit: limitMock,
    });

    fromMock.mockReturnValue({
      select: selectMock,
    });

    await service.loadCurrentDocument();

    expect(fromMock).toHaveBeenCalledWith('service_documents');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(limitMock).toHaveBeenCalledWith(1);

    expect(service.currentDocument()).toEqual({
      id: 'document-id',
      storagePath: 'previous-services.pdf',
      originalName: 'services.pdf',
      mimeType: 'application/pdf',
      size: 1000,
      createdAt: '2026-08-06T10:00:00.000Z',
      updatedAt: '2026-08-06T10:00:00.000Z',
    });

    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should set the current document to null when none exists', async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
    });

    await service.loadCurrentDocument();

    expect(service.currentDocument()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should handle an error while loading the document', async () => {
    const loadError = new Error('Unable to load document');

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: loadError,
          }),
        }),
      }),
    });

    await expect(service.loadCurrentDocument()).rejects.toThrow('Unable to load document');

    expect(service.currentDocument()).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(true);
  });

  it('should upload and insert the first document', async () => {
    const file = new File(['document content'], 'New Services.pdf', {
      type: 'application/pdf',
    });

    const uploadMock = vi.fn().mockResolvedValue({
      error: null,
    });

    storageFromMock.mockReturnValue({
      upload: uploadMock,
    });

    const singleMock = vi.fn().mockResolvedValue({
      data: updatedDocumentRow,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      single: singleMock,
    });

    const insertMock = vi.fn().mockReturnValue({
      select: selectMock,
    });

    fromMock.mockReturnValue({
      insert: insertMock,
    });

    await service.uploadDocument(file);

    expect(storageFromMock).toHaveBeenCalledWith('service-documents');

    expect(uploadMock).toHaveBeenCalledTimes(1);

    const uploadedStoragePath = uploadMock.mock.calls[0][0] as string;

    expect(uploadedStoragePath).toContain('new-services.pdf');

    expect(uploadMock).toHaveBeenCalledWith(uploadedStoragePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storage_path: uploadedStoragePath,
        original_name: 'New Services.pdf',
        mime_type: 'application/pdf',
        size: file.size,
      }),
    );

    expect(service.currentDocument()).toEqual({
      id: updatedDocumentRow.id,
      storagePath: updatedDocumentRow.storage_path,
      originalName: updatedDocumentRow.original_name,
      mimeType: updatedDocumentRow.mime_type,
      size: updatedDocumentRow.size,
      createdAt: updatedDocumentRow.created_at,
      updatedAt: updatedDocumentRow.updated_at,
    });

    expect(service.isUploading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should replace the current document and remove the previous file', async () => {
    const file = new File(['new document content'], 'new-services.pdf', {
      type: 'application/pdf',
    });

    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: documentRow,
            error: null,
          }),
        }),
      }),
    });

    await service.loadCurrentDocument();

    const uploadMock = vi.fn().mockResolvedValue({
      error: null,
    });

    const removeMock = vi.fn().mockResolvedValue({
      error: null,
    });

    storageFromMock.mockReturnValue({
      upload: uploadMock,
      remove: removeMock,
    });

    const singleMock = vi.fn().mockResolvedValue({
      data: updatedDocumentRow,
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({
      single: singleMock,
    });

    const eqMock = vi.fn().mockReturnValue({
      select: selectMock,
    });

    const updateMock = vi.fn().mockReturnValue({
      eq: eqMock,
    });

    fromMock.mockReturnValue({
      update: updateMock,
    });

    await service.uploadDocument(file);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith('id', documentRow.id);

    expect(removeMock).toHaveBeenCalledWith([documentRow.storage_path]);

    expect(service.currentDocument()?.storagePath).toBe(updatedDocumentRow.storage_path);

    expect(service.isUploading()).toBe(false);
  });

  it('should clean up the uploaded file when the database operation fails', async () => {
    const databaseError = new Error('Unable to save document metadata');

    const file = new File(['document content'], 'services.pdf', {
      type: 'application/pdf',
    });

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const uploadMock = vi.fn().mockResolvedValue({
      error: null,
    });

    const removeMock = vi.fn().mockResolvedValue({
      error: null,
    });

    storageFromMock.mockReturnValue({
      upload: uploadMock,
      remove: removeMock,
    });

    const singleMock = vi.fn().mockResolvedValue({
      data: null,
      error: databaseError,
    });

    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: singleMock,
        }),
      }),
    });

    await expect(service.uploadDocument(file)).rejects.toThrow('Unable to save document metadata');

    const uploadedStoragePath = uploadMock.mock.calls[0][0] as string;

    expect(removeMock).toHaveBeenCalledWith([uploadedStoragePath]);

    expect(service.currentDocument()).toBeNull();
    expect(service.isUploading()).toBe(false);
    expect(service.hasError()).toBe(true);
  });

  it('should delete the current document and its stored file', async () => {
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: documentRow,
            error: null,
          }),
        }),
      }),
    });

    await service.loadCurrentDocument();

    const eqMock = vi.fn().mockResolvedValue({
      error: null,
    });

    const deleteMock = vi.fn().mockReturnValue({
      eq: eqMock,
    });

    fromMock.mockReturnValue({
      delete: deleteMock,
    });

    const removeMock = vi.fn().mockResolvedValue({
      error: null,
    });

    storageFromMock.mockReturnValue({
      remove: removeMock,
    });

    await service.deleteCurrentDocument();

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(eqMock).toHaveBeenCalledWith('id', documentRow.id);

    expect(removeMock).toHaveBeenCalledWith([documentRow.storage_path]);

    expect(service.currentDocument()).toBeNull();
    expect(service.isDeleting()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should do nothing when deleting without a current document', async () => {
    await service.deleteCurrentDocument();

    expect(fromMock).not.toHaveBeenCalled();
    expect(storageFromMock).not.toHaveBeenCalled();
    expect(service.isDeleting()).toBe(false);
  });

  it('should create a signed URL for the document', async () => {
    const createSignedUrlMock = vi.fn().mockResolvedValue({
      data: {
        signedUrl: 'https://example.com/signed-services-document',
      },
      error: null,
    });

    storageFromMock.mockReturnValue({
      createSignedUrl: createSignedUrlMock,
    });

    const signedUrl = await service.createDownloadSignedUrl('documents/services.pdf');

    expect(storageFromMock).toHaveBeenCalledWith('service-documents');

    expect(createSignedUrlMock).toHaveBeenCalledWith('documents/services.pdf', 60);

    expect(signedUrl).toBe('https://example.com/signed-services-document');

    expect(service.hasError()).toBe(false);
  });

  it('should handle an error when creating the signed URL', async () => {
    const signedUrlError = new Error('Unable to create signed URL');

    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    storageFromMock.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({
        data: null,
        error: signedUrlError,
      }),
    });

    await expect(service.createDownloadSignedUrl('documents/services.pdf')).rejects.toThrow(
      'Unable to create signed URL',
    );

    expect(service.hasError()).toBe(true);
  });
});
