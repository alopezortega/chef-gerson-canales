import { TestBed } from "@angular/core/testing";
import { of, Subject, throwError } from "rxjs";
import { vi } from "vitest";

import { SUPABASE_CLIENT } from "../../../core/config/supabase-client.token";
import { AdminQuoteRequestApiService } from "../api/admin-quote-request-api.service";
import type { AdminQuoteRequest } from "../models/admin-quote-request.model";
import { AdminQuoteRequestService } from "./admin-quote-request.service";

describe("AdminQuoteRequestService", () => {
  let service: AdminQuoteRequestService;

  const quoteRequest: AdminQuoteRequest = {
    id: "request-123",
    name: "Alejandro",
    email: "alejandro@example.com",
    phone: "600123123",
    eventType: "private-dinner",
    eventDate: "2026-08-15",
    guestCount: 4,
    location: "Madrid",
    dietaryRequirements: "No nuts",
    additionalInformation: "Dinner at home",
    privacyAccepted: true,
    attachmentPath: "request-123/menu.pdf",
    attachmentName: "menu.pdf",
    attachmentType: "application/pdf",
    attachmentSize: 117111,
    status: "pending",
    createdAt: "2026-08-03T08:39:38.695Z",
  };

  const getQuoteRequestsMock = vi.fn();
  const getQuoteRequestByIdMock = vi.fn();
  const updateQuoteRequestStatusMock = vi.fn();
  const getAttachmentSignedUrlMock = vi.fn();
  const deleteQuoteRequestMock = vi.fn();

  const apiServiceMock = {
    getQuoteRequests: getQuoteRequestsMock,
    getQuoteRequestById: getQuoteRequestByIdMock,
    updateQuoteRequestStatus: updateQuoteRequestStatusMock,
    getAttachmentSignedUrl: getAttachmentSignedUrlMock,
    deleteQuoteRequest: deleteQuoteRequestMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    getQuoteRequestsMock.mockReturnValue(of([]));
    getQuoteRequestByIdMock.mockReturnValue(of(quoteRequest));
    updateQuoteRequestStatusMock.mockReturnValue(of(undefined));
    getAttachmentSignedUrlMock.mockReturnValue(
      of("https://example.com/signed/menu.pdf"),
    );
    deleteQuoteRequestMock.mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        AdminQuoteRequestService,
        {
          provide: AdminQuoteRequestApiService,
          useValue: apiServiceMock,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    });

    service = TestBed.inject(AdminQuoteRequestService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load quote requests", () => {
    getQuoteRequestsMock.mockReturnValue(of([quoteRequest]));

    service.loadQuoteRequests().subscribe();

    expect(getQuoteRequestsMock).toHaveBeenCalledTimes(1);
    expect(service.requests()).toEqual([quoteRequest]);
    expect(service.hasError()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it("should keep loading true while quote requests are pending", () => {
    const requestsSubject = new Subject<AdminQuoteRequest[]>();

    getQuoteRequestsMock.mockReturnValue(requestsSubject.asObservable());

    service.loadQuoteRequests().subscribe();

    expect(service.isLoading()).toBe(true);

    requestsSubject.next([quoteRequest]);
    requestsSubject.complete();

    expect(service.requests()).toEqual([quoteRequest]);
    expect(service.isLoading()).toBe(false);
  });

  it("should handle an error when loading quote requests", () => {
    const error = new Error("Unable to load requests");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    getQuoteRequestsMock.mockReturnValue(
      throwError(() => error),
    );

    service.loadQuoteRequests().subscribe();

    expect(service.requests()).toEqual([]);
    expect(service.hasError()).toBe(true);
    expect(service.isLoading()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should load one quote request by id", () => {
    getQuoteRequestByIdMock.mockReturnValue(of(quoteRequest));

    service
      .loadQuoteRequestById(quoteRequest.id)
      .subscribe();

    expect(getQuoteRequestByIdMock).toHaveBeenCalledWith(
      quoteRequest.id,
    );
    expect(service.selectedRequest()).toEqual(quoteRequest);
    expect(service.hasError()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it("should handle an error when loading one quote request", () => {
    const error = new Error("Unable to load request");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    getQuoteRequestByIdMock.mockReturnValue(
      throwError(() => error),
    );

    service
      .loadQuoteRequestById(quoteRequest.id)
      .subscribe();

    expect(service.selectedRequest()).toBeNull();
    expect(service.hasError()).toBe(true);
    expect(service.isLoading()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should update the selected request status", () => {
    getQuoteRequestByIdMock.mockReturnValue(of(quoteRequest));

    service
      .loadQuoteRequestById(quoteRequest.id)
      .subscribe();

    service
      .updateQuoteRequestStatus(
        quoteRequest.id,
        "contacted",
      )
      .subscribe();

    expect(updateQuoteRequestStatusMock).toHaveBeenCalledWith(
      quoteRequest.id,
      "contacted",
    );

    expect(service.selectedRequest()).toEqual({
      ...quoteRequest,
      status: "contacted",
    });
  });

  it("should update the matching request inside the list", () => {
    getQuoteRequestsMock.mockReturnValue(of([quoteRequest]));

    service.loadQuoteRequests().subscribe();

    service
      .updateQuoteRequestStatus(
        quoteRequest.id,
        "closed",
      )
      .subscribe();

    expect(service.requests()).toEqual([
      {
        ...quoteRequest,
        status: "closed",
      },
    ]);
  });

  it("should keep isUpdatingStatus true while the update is pending", () => {
    const updateSubject = new Subject<void>();

    updateQuoteRequestStatusMock.mockReturnValue(
      updateSubject.asObservable(),
    );

    service
      .updateQuoteRequestStatus(
        quoteRequest.id,
        "contacted",
      )
      .subscribe();

    expect(service.isUpdatingStatus()).toBe(true);

    updateSubject.next();
    updateSubject.complete();

    expect(service.isUpdatingStatus()).toBe(false);
  });

  it("should handle an error when updating status", () => {
    const error = new Error("Unable to update status");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    updateQuoteRequestStatusMock.mockReturnValue(
      throwError(() => error),
    );

    service
      .updateQuoteRequestStatus(
        quoteRequest.id,
        "closed",
      )
      .subscribe();

    expect(service.hasError()).toBe(true);
    expect(service.isUpdatingStatus()).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should return an attachment signed URL", () => {
    const signedUrl = "https://example.com/signed/menu.pdf";

    getAttachmentSignedUrlMock.mockReturnValue(of(signedUrl));

    let result: string | undefined;

    service
      .createAttachmentSignedUrl(
        quoteRequest.attachmentPath!,
      )
      .subscribe((url) => {
        result = url;
      });

    expect(getAttachmentSignedUrlMock).toHaveBeenCalledWith(
      quoteRequest.attachmentPath,
    );
    expect(result).toBe(signedUrl);
  });

  it("should propagate an attachment signed URL error", () => {
    const error = new Error("Unable to create signed URL");

    getAttachmentSignedUrlMock.mockReturnValue(
      throwError(() => error),
    );

    let receivedError: unknown;

    service
      .createAttachmentSignedUrl(
        quoteRequest.attachmentPath!,
      )
      .subscribe({
        error: (currentError) => {
          receivedError = currentError;
        },
      });

    expect(receivedError).toBe(error);
  });

  it("should delete a quote request and remove it from the list", () => {
    getQuoteRequestsMock.mockReturnValue(of([quoteRequest]));

    service.loadQuoteRequests().subscribe();

    service
      .deleteQuoteRequest(quoteRequest.id)
      .subscribe();

    expect(deleteQuoteRequestMock).toHaveBeenCalledWith(
      quoteRequest.id,
    );
    expect(service.requests()).toEqual([]);
    expect(service.isDeleting()).toBe(false);
  });

  it("should clear the selected request after deleting it", () => {
    getQuoteRequestByIdMock.mockReturnValue(of(quoteRequest));

    service
      .loadQuoteRequestById(quoteRequest.id)
      .subscribe();

    service
      .deleteQuoteRequest(quoteRequest.id)
      .subscribe();

    expect(service.selectedRequest()).toBeNull();
  });

  it("should keep isDeleting true while deletion is pending", () => {
    const deleteSubject = new Subject<void>();

    deleteQuoteRequestMock.mockReturnValue(
      deleteSubject.asObservable(),
    );

    service
      .deleteQuoteRequest(quoteRequest.id)
      .subscribe();

    expect(service.isDeleting()).toBe(true);

    deleteSubject.next();
    deleteSubject.complete();

    expect(service.isDeleting()).toBe(false);
  });
});
