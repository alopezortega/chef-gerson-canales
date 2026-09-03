import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, throwError } from "rxjs";

import { QuoteRequestApiService } from "../api/quote-request-api.service";
import { QuoteRequest } from "../models/quote-request.model";

import { QuoteRequestService } from "./quote-request.service";

describe("QuoteRequestService", () => {
  let service: QuoteRequestService;

  const quoteRequestApiServiceMock = {
    createQuoteRequest: vi.fn(),
  };

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
    quoteRequestApiServiceMock.createQuoteRequest.mockReset();
    quoteRequestApiServiceMock.createQuoteRequest.mockReturnValue(
      of(undefined),
    );

    TestBed.configureTestingModule({
      providers: [
        QuoteRequestService,
        {
          provide: QuoteRequestApiService,
          useValue: quoteRequestApiServiceMock,
        },
      ],
    });

    service = TestBed.inject(QuoteRequestService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should delegate quote request creation to the API service", async () => {
    await firstValueFrom(
      service.createQuoteRequest(quoteRequest, null),
    );

    expect(
      quoteRequestApiServiceMock.createQuoteRequest,
    ).toHaveBeenCalledWith(quoteRequest, null);
  });

  it("should delegate the attachment to the API service", async () => {
    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    await firstValueFrom(
      service.createQuoteRequest(quoteRequest, file),
    );

    expect(
      quoteRequestApiServiceMock.createQuoteRequest,
    ).toHaveBeenCalledWith(quoteRequest, file);
  });

  it("should propagate API errors", async () => {
    const error = new Error("Unable to create quote request");

    quoteRequestApiServiceMock.createQuoteRequest.mockReturnValueOnce(
      throwError(() => error),
    );

    await expect(
      firstValueFrom(
        service.createQuoteRequest(quoteRequest, null),
      ),
    ).rejects.toThrow("Unable to create quote request");
  });
});
