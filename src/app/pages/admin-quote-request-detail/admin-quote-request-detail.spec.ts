import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { vi } from 'vitest';

import type { AdminQuoteRequest } from '../../features/quote-request/models/admin-quote-request.model';
import { AdminQuoteRequestService } from '../../features/quote-request/services/admin-quote-request.service';
import { AdminQuoteRequestDetail } from './admin-quote-request-detail';

describe('AdminQuoteRequestDetail', () => {
  let component: AdminQuoteRequestDetail;
  let fixture: ComponentFixture<AdminQuoteRequestDetail>;

  const requestId = '83cda03c-531d-421f-939f-d1c541a3f596';

  const quoteRequest: AdminQuoteRequest = {
    id: requestId,
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

  const loadQuoteRequestByIdMock = vi.fn();
  const updateQuoteRequestStatusMock = vi.fn();
  const createAttachmentSignedUrlMock = vi.fn();

  const selectedRequestState = signal<AdminQuoteRequest | null>(null);
  const isLoadingState = signal(false);
  const hasErrorState = signal(false);
  const isUpdatingStatusState = signal(false);

  const adminQuoteRequestServiceMock = {
    selectedRequest: selectedRequestState.asReadonly(),
    isLoading: isLoadingState.asReadonly(),
    hasError: hasErrorState.asReadonly(),
    isUpdatingStatus: isUpdatingStatusState.asReadonly(),
    loadQuoteRequestById: loadQuoteRequestByIdMock,
    updateQuoteRequestStatus: updateQuoteRequestStatusMock,
    createAttachmentSignedUrl: createAttachmentSignedUrlMock,
  };

  async function configureTest(routeId: string | null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [AdminQuoteRequestDetail],
      providers: [
        provideRouter([]),
        provideTranslateService({
          lang: 'es',
          fallbackLang: 'es',
        }),
        {
          provide: AdminQuoteRequestService,
          useValue: adminQuoteRequestServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(
                routeId
                  ? {
                      id: routeId,
                    }
                  : {},
              ),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminQuoteRequestDetail);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();

    selectedRequestState.set(null);
    isLoadingState.set(false);
    hasErrorState.set(false);
    isUpdatingStatusState.set(false);

    loadQuoteRequestByIdMock.mockResolvedValue(undefined);
    updateQuoteRequestStatusMock.mockResolvedValue(undefined);
    createAttachmentSignedUrlMock.mockResolvedValue('https://example.com/signed/menu.pdf');
  });

  it('should create', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load the quote request using the route id', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(loadQuoteRequestByIdMock).toHaveBeenCalledTimes(1);
    expect(loadQuoteRequestByIdMock).toHaveBeenCalledWith(requestId);
  });

  it('should expose the route id', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    expect(component['idUrl']()).toBe(requestId);
  });

  it('should not load a quote request when the route id is missing', async () => {
    await configureTest(null);

    fixture.detectChanges();

    expect(loadQuoteRequestByIdMock).not.toHaveBeenCalled();
    expect(component['idUrl']()).toBeNull();
  });

  it('should update the selected status from the select event', async () => {
    await configureTest(requestId);

    const event = {
      target: {
        value: 'closed',
      },
    } as unknown as Event;

    component['onStatusChange'](event);

    expect(component['selectedStatus']()).toBe('closed');
  });

  it('should call the service with the request id and selected status', async () => {
    selectedRequestState.set(quoteRequest);

    await configureTest(requestId);

    fixture.detectChanges();

    component['selectedStatus'].set('contacted');

    await component['updateStatus']();

    expect(updateQuoteRequestStatusMock).toHaveBeenCalledTimes(1);

    expect(updateQuoteRequestStatusMock).toHaveBeenCalledWith(quoteRequest.id, 'contacted');
  });

  it('should not update the status when no request is selected', async () => {
    await configureTest(requestId);

    fixture.detectChanges();

    await component['updateStatus']();

    expect(updateQuoteRequestStatusMock).not.toHaveBeenCalled();
  });

  it('should synchronize the selected status with the loaded request', async () => {
    selectedRequestState.set({
      ...quoteRequest,
      status: 'closed',
    });

    await configureTest(requestId);

    fixture.detectChanges();

    expect(component['selectedStatus']()).toBe('closed');
  });

  it('should request a signed URL and open the attachment', async () => {
    const signedUrl = 'https://example.com/signed/menu.pdf';

    selectedRequestState.set(quoteRequest);
    createAttachmentSignedUrlMock.mockResolvedValue(signedUrl);

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await configureTest(requestId);

    fixture.detectChanges();

    await component['openAttachment']();

    expect(createAttachmentSignedUrlMock).toHaveBeenCalledTimes(1);

    expect(createAttachmentSignedUrlMock).toHaveBeenCalledWith(quoteRequest.attachmentPath);

    expect(windowOpenSpy).toHaveBeenCalledWith(signedUrl, '_blank', 'noopener,noreferrer');

    expect(component['isOpeningAttachment']()).toBe(false);

    windowOpenSpy.mockRestore();
  });

  it('should not open an attachment when the request has no attachment path', async () => {
    selectedRequestState.set({
      ...quoteRequest,
      attachmentPath: null,
      attachmentName: null,
      attachmentType: null,
      attachmentSize: null,
    });

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await configureTest(requestId);

    fixture.detectChanges();

    await component['openAttachment']();

    expect(createAttachmentSignedUrlMock).not.toHaveBeenCalled();

    expect(windowOpenSpy).not.toHaveBeenCalled();

    expect(component['isOpeningAttachment']()).toBe(false);

    windowOpenSpy.mockRestore();
  });

  it('should keep isOpeningAttachment true while the signed URL is pending', async () => {
    selectedRequestState.set(quoteRequest);

    let resolveSignedUrl: ((value: string) => void) | undefined;

    createAttachmentSignedUrlMock.mockReturnValue(
      new Promise<string>((resolve) => {
        resolveSignedUrl = resolve;
      }),
    );

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await configureTest(requestId);

    fixture.detectChanges();

    const openPromise = component['openAttachment']();

    expect(component['isOpeningAttachment']()).toBe(true);

    resolveSignedUrl?.('https://example.com/signed/menu.pdf');

    await openPromise;

    expect(component['isOpeningAttachment']()).toBe(false);

    windowOpenSpy.mockRestore();
  });

  it('should handle an error when opening the attachment', async () => {
    const attachmentError = new Error('Unable to create signed URL');

    selectedRequestState.set(quoteRequest);
    createAttachmentSignedUrlMock.mockRejectedValue(attachmentError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    await configureTest(requestId);

    fixture.detectChanges();

    await component['openAttachment']();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to open attachment:', attachmentError);

    expect(windowOpenSpy).not.toHaveBeenCalled();

    expect(component['isOpeningAttachment']()).toBe(false);

    consoleErrorSpy.mockRestore();
    windowOpenSpy.mockRestore();
  });
});
