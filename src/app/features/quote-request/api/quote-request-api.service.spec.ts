import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { QuoteRequest } from "../models/quote-request.model";

import { QuoteRequestApiService } from "./quote-request-api.service";

describe("QuoteRequestApiService", () => {
  let service: QuoteRequestApiService;
  let httpTestingController: HttpTestingController;

  const apiUrl = `${environment.supabase.url}/functions/v1`;

  const quoteRequest: QuoteRequest = {
    name: "Alejandro",
    email: "alejandro@example.com",
    phone: "600123123",
    eventType: "private-dinner",
    eventDate: "2999-01-01",
    guestCount: 4,
    location: "Madrid",
    dietaryRequirements: "No nuts",
    additionalInformation: "Dinner at home",
    privacyAccepted: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuoteRequestApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(QuoteRequestApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should create a quote request without an attachment", () => {
    service.createQuoteRequest(quoteRequest, null).subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/submit-quote-request`,
    );

    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);

    const formData = request.request.body as FormData;

    expect(formData.get("request")).toBe(
      JSON.stringify(quoteRequest),
    );

    expect(formData.has("attachment")).toBe(false);

    request.flush(null, {
      status: 204,
      statusText: "No Content",
    });
  });

  it("should create a quote request with an attachment", () => {
    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    service.createQuoteRequest(quoteRequest, file).subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/submit-quote-request`,
    );

    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);

    const formData = request.request.body as FormData;

    expect(formData.get("request")).toBe(
      JSON.stringify(quoteRequest),
    );

    expect(formData.get("attachment")).toBe(file);

    request.flush(null, {
      status: 204,
      statusText: "No Content",
    });
  });
});
