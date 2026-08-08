import { TestBed } from "@angular/core/testing";
import { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_CLIENT } from "../../../core/config/supabase-client.token";
import { QuoteRequest } from "../models/quote-request.model";
import { QuoteRequestService } from "./quote-request.service";

describe("QuoteRequestService", () => {
  let service: QuoteRequestService;

  const uploadMock = vi.fn();
  const storageFromMock = vi.fn();

  const insertMock = vi.fn();
  const selectMock = vi.fn();
  const singleMock = vi.fn();
  const tableFromMock = vi.fn();

  const invokeMock = vi.fn();

  const supabaseClientMock = {
    storage: {
      from: storageFromMock,
    },
    from: tableFromMock,
    functions: {
      invoke: invokeMock,
    },
  } as unknown as SupabaseClient;

  const quoteRequest: QuoteRequest = {
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
  };

  beforeEach(() => {
    uploadMock.mockReset();
    storageFromMock.mockReset();

    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
    tableFromMock.mockReset();

    invokeMock.mockReset();

    uploadMock.mockResolvedValue({
      data: {
        path: "test-uuid/menu.pdf",
      },
      error: null,
    });

    singleMock.mockResolvedValue({
      data: {
        id: "quote-request-id",
      },
      error: null,
    });

    selectMock.mockReturnValue({
      single: singleMock,
    });

    insertMock.mockReturnValue({
      select: selectMock,
    });

    storageFromMock.mockReturnValue({
      upload: uploadMock,
    });

    tableFromMock.mockReturnValue({
      insert: insertMock,
    });

    invokeMock.mockResolvedValue({
      data: {
        success: true,
      },
      error: null,
    });

    TestBed.configureTestingModule({
      providers: [
        QuoteRequestService,
        {
          provide: SUPABASE_CLIENT,
          useValue: supabaseClientMock,
        },
      ],
    });

    service = TestBed.inject(QuoteRequestService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should insert a quote request without an attachment", async () => {
    await service.createQuoteRequest(quoteRequest, null);

    expect(storageFromMock).not.toHaveBeenCalled();

    expect(tableFromMock).toHaveBeenCalledWith("quote_requests");

    expect(insertMock).toHaveBeenCalledWith({
      name: "Alejandro",
      email: "alejandro@example.com",
      phone: "600123123",
      event_type: "private-dinner",
      event_date: "2026-08-15",
      guest_count: 4,
      location: "Madrid",
      dietary_requirements: "No nuts",
      additional_information: "Dinner at home",
      privacy_accepted: true,
      attachment_path: null,
      attachment_name: null,
      attachment_type: null,
      attachment_size: null,
    });

    expect(selectMock).toHaveBeenCalledWith("id");
    expect(singleMock).toHaveBeenCalled();
  });

  it("should upload the attachment and insert its metadata", async () => {
    const file = new File(["test content"], "Ménu Gerson.pdf", {
      type: "application/pdf",
    });

    await service.createQuoteRequest(quoteRequest, file);

    expect(storageFromMock).toHaveBeenCalledWith("quote-request-attachments");

    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/menu-gerson\.pdf$/),
      file,
      {
        contentType: "application/pdf",
        upsert: false,
      },
    );

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attachment_path: "test-uuid/menu.pdf",
        attachment_name: "Ménu Gerson.pdf",
        attachment_type: "application/pdf",
        attachment_size: file.size,
      }),
    );
  });

  it("should throw an error and not insert when the attachment upload fails", async () => {
    const file = new File(["test content"], "menu.pdf", {
      type: "application/pdf",
    });

    const uploadError = new Error("Upload failed");

    uploadMock.mockResolvedValueOnce({
      data: null,
      error: uploadError,
    });

    await expect(service.createQuoteRequest(quoteRequest, file)).rejects
      .toThrow("Upload failed");

    expect(insertMock).not.toHaveBeenCalled();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("should throw an error when the database insert fails", async () => {
    const databaseError = new Error("Database insert failed");

    singleMock.mockResolvedValueOnce({
      data: null,
      error: databaseError,
    });

    await expect(service.createQuoteRequest(quoteRequest, null)).rejects
      .toThrow(
        "Database insert failed",
      );
  });

  it("should invoke the quote request notification with the created request id", async () => {
    await service.createQuoteRequest(quoteRequest, null);

    expect(invokeMock).toHaveBeenCalledWith("notify-quote-request", {
      body: {
        quoteRequestId: "quote-request-id",
      },
    });
  });

  it("should not invoke the notification when the database insert fails", async () => {
    const databaseError = new Error("Database insert failed");

    singleMock.mockResolvedValueOnce({
      data: null,
      error: databaseError,
    });

    await expect(service.createQuoteRequest(quoteRequest, null)).rejects
      .toThrow(
        "Database insert failed",
      );

    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("should not fail the quote request when the notification fails", async () => {
    invokeMock.mockResolvedValueOnce({
      data: null,
      error: new Error("Notification failed"),
    });

    await expect(service.createQuoteRequest(quoteRequest, null)).resolves
      .toBeUndefined();

    expect(invokeMock).toHaveBeenCalledWith("notify-quote-request", {
      body: {
        quoteRequestId: "quote-request-id",
      },
    });
  });
});
