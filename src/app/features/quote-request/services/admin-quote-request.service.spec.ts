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
  const singleMock = vi.fn();

  const queryBuilderMock = {
    select: vi.fn(),
    order: orderMock,
    eq: vi.fn(),
    single: singleMock,
  };

  const supabaseClientMock = {
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryBuilderMock.select.mockReturnValue(queryBuilderMock);
    queryBuilderMock.eq.mockReturnValue(queryBuilderMock);
    supabaseClientMock.from.mockReturnValue(queryBuilderMock);

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
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', quoteRequestRow.id);
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
});
