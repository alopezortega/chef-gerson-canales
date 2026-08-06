import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { SUPABASE_CLIENT } from '../../../core/config/supabase-client.token';
import type { AdminQuoteRequest, AdminQuoteRequestRow } from '../models/admin-quote-request.model';
import { AdminQuoteRequestService } from './admin-quote-request.service';

describe('AdminQuoteRequestService', () => {
  let service: AdminQuoteRequestService;

  const quoteRequestRow: AdminQuoteRequestRow = {
    id: 'request-123',
    name: 'Alejandro',
    email: 'alejandro@example.com',
    phone: '600123123',
    event_type: 'private-dinner',
    event_date: '2026-08-15',
    guest_count: 4,
    location: 'Madrid',
    dietary_requirements: 'No nuts',
    additional_information: 'Dinner at home',
    privacy_accepted: true,
    attachment_path: 'request-123/menu.pdf',
    attachment_name: 'menu.pdf',
    attachment_type: 'application/pdf',
    attachment_size: 117111,
    status: 'pending',
    created_at: '2026-08-03T08:39:38.695Z',
  };

  const expectedQuoteRequest: AdminQuoteRequest = {
    id: 'request-123',
    name: 'Alejandro',
    email: 'alejandro@example.com',
    phone: '600123123',
    eventType: 'private-dinner',
    eventDate: '2026-08-15',
    guestCount: 4,
    location: 'Madrid',
    dietaryRequirements: 'No nuts',
    additionalInformation: 'Dinner at home',
    privacyAccepted: true,
    attachmentPath: 'request-123/menu.pdf',
    attachmentName: 'menu.pdf',
    attachmentType: 'application/pdf',
    attachmentSize: 117111,
    status: 'pending',
    createdAt: '2026-08-03T08:39:38.695Z',
  };

  const orderMock = vi.fn();
  const detailEqMock = vi.fn();
  const singleMock = vi.fn();

  const updateMock = vi.fn();
  const updateEqMock = vi.fn();

  const storageFromMock = vi.fn();
  const createSignedUrlMock = vi.fn();

  const selectQueryBuilderMock = {
    order: orderMock,
    eq: detailEqMock,
  };

  const detailQueryBuilderMock = {
    single: singleMock,
  };

  const updateQueryBuilderMock = {
    eq: updateEqMock,
  };

  const queryBuilderMock = {
    select: vi.fn(),
    update: updateMock,
  };

  const storageBucketMock = {
    createSignedUrl: createSignedUrlMock,
  };

  const supabaseClientMock = {
    from: vi.fn(),
    storage: {
      from: storageFromMock,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryBuilderMock.select.mockReturnValue(selectQueryBuilderMock);
    detailEqMock.mockReturnValue(detailQueryBuilderMock);
    updateMock.mockReturnValue(updateQueryBuilderMock);
    supabaseClientMock.from.mockReturnValue(queryBuilderMock);

    storageFromMock.mockReturnValue(storageBucketMock);

    TestBed.configureTestingModule({
      providers: [
        AdminQuoteRequestService,
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClientMock,
        },
      ],
    });

    service = TestBed.inject(AdminQuoteRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load and map quote requests', async () => {
    orderMock.mockResolvedValue({
      data: [quoteRequestRow],
      error: null,
    });

    const loadPromise = service.loadQuoteRequests();

    expect(service.isLoading()).toBe(true);
    expect(service.hasError()).toBe(false);

    await loadPromise;

    expect(supabaseClientMock.from).toHaveBeenCalledWith('quote_requests');
    expect(queryBuilderMock.select).toHaveBeenCalledWith('*');
    expect(orderMock).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });

    expect(service.requests()).toEqual([expectedQuoteRequest]);
    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should handle an error when loading quote requests', async () => {
    const supabaseError = {
      message: 'Unable to load quote requests',
    };

    orderMock.mockResolvedValue({
      data: null,
      error: supabaseError,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await service.loadQuoteRequests();

    expect(service.requests()).toEqual([]);
    expect(service.hasError()).toBe(true);
    expect(service.isLoading()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to load quote requests:', supabaseError);

    consoleErrorSpy.mockRestore();
  });

  it('should load and map one quote request by id', async () => {
    singleMock.mockResolvedValue({
      data: quoteRequestRow,
      error: null,
    });

    const loadPromise = service.loadQuoteRequestById(quoteRequestRow.id);

    expect(service.isLoading()).toBe(true);
    expect(service.selectedRequest()).toBeNull();

    await loadPromise;

    expect(supabaseClientMock.from).toHaveBeenCalledWith('quote_requests');
    expect(queryBuilderMock.select).toHaveBeenCalledWith('*');
    expect(detailEqMock).toHaveBeenCalledWith('id', quoteRequestRow.id);
    expect(singleMock).toHaveBeenCalledTimes(1);

    expect(service.selectedRequest()).toEqual(expectedQuoteRequest);
    expect(service.hasError()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should handle an error when loading one quote request by id', async () => {
    const supabaseError = {
      message: 'Quote request not found',
    };

    singleMock.mockResolvedValue({
      data: null,
      error: supabaseError,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await service.loadQuoteRequestById('missing-request');

    expect(service.selectedRequest()).toBeNull();
    expect(service.hasError()).toBe(true);
    expect(service.isLoading()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to load quote request:', supabaseError);

    consoleErrorSpy.mockRestore();
  });

  it('should update only the quote request status in Supabase', async () => {
    updateEqMock.mockResolvedValue({
      error: null,
    });

    await service.updateQuoteRequestStatus(quoteRequestRow.id, 'contacted');

    expect(supabaseClientMock.from).toHaveBeenCalledWith('quote_requests');
    expect(updateMock).toHaveBeenCalledWith({
      status: 'contacted',
    });
    expect(updateEqMock).toHaveBeenCalledWith('id', quoteRequestRow.id);
  });

  it('should update the selected request status after a successful update', async () => {
    singleMock.mockResolvedValue({
      data: quoteRequestRow,
      error: null,
    });

    updateEqMock.mockResolvedValue({
      error: null,
    });

    await service.loadQuoteRequestById(quoteRequestRow.id);
    await service.updateQuoteRequestStatus(quoteRequestRow.id, 'contacted');

    expect(service.selectedRequest()).toEqual({
      ...expectedQuoteRequest,
      status: 'contacted',
    });
  });

  it('should update the matching request inside the requests list', async () => {
    orderMock.mockResolvedValue({
      data: [quoteRequestRow],
      error: null,
    });

    updateEqMock.mockResolvedValue({
      error: null,
    });

    await service.loadQuoteRequests();
    await service.updateQuoteRequestStatus(quoteRequestRow.id, 'closed');

    expect(service.requests()).toEqual([
      {
        ...expectedQuoteRequest,
        status: 'closed',
      },
    ]);
  });

  it('should keep isUpdatingStatus true while the update is pending', async () => {
    let resolveUpdate: ((value: { error: null }) => void) | undefined;

    updateEqMock.mockReturnValue(
      new Promise<{ error: null }>((resolve) => {
        resolveUpdate = resolve;
      }),
    );

    const updatePromise = service.updateQuoteRequestStatus(quoteRequestRow.id, 'contacted');

    expect(service.isUpdatingStatus()).toBe(true);
    expect(service.hasError()).toBe(false);

    resolveUpdate?.({
      error: null,
    });

    await updatePromise;

    expect(service.isUpdatingStatus()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it('should handle an error when updating the quote request status', async () => {
    const supabaseError = {
      message: 'Unable to update quote request status',
    };

    orderMock.mockResolvedValue({
      data: [quoteRequestRow],
      error: null,
    });

    singleMock.mockResolvedValue({
      data: quoteRequestRow,
      error: null,
    });

    updateEqMock.mockResolvedValue({
      error: supabaseError,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await service.loadQuoteRequests();
    await service.loadQuoteRequestById(quoteRequestRow.id);
    await service.updateQuoteRequestStatus(quoteRequestRow.id, 'closed');

    expect(service.hasError()).toBe(true);
    expect(service.isUpdatingStatus()).toBe(false);

    expect(service.selectedRequest()).toEqual(expectedQuoteRequest);
    expect(service.requests()).toEqual([expectedQuoteRequest]);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to update status:', supabaseError);

    consoleErrorSpy.mockRestore();
  });

  it('should create and return a signed attachment URL', async () => {
    const signedUrl = 'https://example.supabase.co/storage/signed/menu.pdf';

    createSignedUrlMock.mockResolvedValue({
      data: {
        signedUrl,
      },
      error: null,
    });

    const result = await service.createAttachmentSignedUrl(quoteRequestRow.attachment_path!);

    expect(storageFromMock).toHaveBeenCalledWith('quote-request-attachments');
    expect(createSignedUrlMock).toHaveBeenCalledWith(quoteRequestRow.attachment_path, 60);
    expect(result).toBe(signedUrl);
  });

  it('should throw the Storage error when creating a signed URL fails', async () => {
    const storageError = {
      message: 'Object not found',
    };

    createSignedUrlMock.mockResolvedValue({
      data: null,
      error: storageError,
    });

    await expect(service.createAttachmentSignedUrl(quoteRequestRow.attachment_path!)).rejects.toBe(
      storageError,
    );
  });

  it('should throw when Supabase does not return a signed URL', async () => {
    createSignedUrlMock.mockResolvedValue({
      data: {
        signedUrl: '',
      },
      error: null,
    });

    await expect(
      service.createAttachmentSignedUrl(quoteRequestRow.attachment_path!),
    ).rejects.toThrow('Unable to create attachment signed URL');
  });
});
