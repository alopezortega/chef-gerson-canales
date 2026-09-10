import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import type {
  AdminQuoteRequest,
  QuoteRequestStatus,
} from "../models/admin-quote-request.model";
import { AdminQuoteRequestApiService } from "./admin-quote-request-api.service";

describe("AdminQuoteRequestApiService", () => {
  let service: AdminQuoteRequestApiService;
  let httpTestingController: HttpTestingController;

  const apiUrl = `${environment.supabase.url}/functions/v1`;

  const quoteRequest: AdminQuoteRequest = {
    id: "83cda03c-531d-421f-939f-d1c541a3f596",
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminQuoteRequestApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AdminQuoteRequestApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load quote requests", () => {
    const response: AdminQuoteRequest[] = [quoteRequest];

    service.getQuoteRequests().subscribe((requests) => {
      expect(requests).toEqual(response);
    });

    const request = httpTestingController.expectOne(
      `${apiUrl}/quote-requests`,
    );

    expect(request.request.method).toBe("GET");

    request.flush(response);
  });

  it("should load a quote request by id", () => {
    service
      .getQuoteRequestById(quoteRequest.id)
      .subscribe((request) => {
        expect(request).toEqual(quoteRequest);
      });

    const request = httpTestingController.expectOne(
      `${apiUrl}/quote-requests/${quoteRequest.id}`,
    );

    expect(request.request.method).toBe("GET");

    request.flush(quoteRequest);
  });

  it("should update a quote request status", () => {
    const status: QuoteRequestStatus = "contacted";

    service
      .updateQuoteRequestStatus(
        quoteRequest.id,
        status,
      )
      .subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/quote-requests/${quoteRequest.id}`,
    );

    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual({
      status,
    });

    request.flush(null);
  });

  it("should delete a quote request", () => {
    service
      .deleteQuoteRequest(quoteRequest.id)
      .subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/delete-quote-request/${quoteRequest.id}`,
    );

    expect(request.request.method).toBe("DELETE");

    request.flush(null);
  });

  it("should request an attachment signed URL", () => {
    const attachmentPath = "request-123/menu.pdf";
    const signedUrl = "https://example.com/storage/signed/menu.pdf";

    service
      .getAttachmentSignedUrl(attachmentPath)
      .subscribe((url) => {
        expect(url).toBe(signedUrl);
      });

    const request = httpTestingController.expectOne(
      `${apiUrl}/quote-request-attachments/${attachmentPath}`,
    );

    expect(request.request.method).toBe("GET");

    request.flush(signedUrl);
  });
});
