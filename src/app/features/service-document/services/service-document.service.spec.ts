import { TestBed } from "@angular/core/testing";
import { firstValueFrom, of, throwError } from "rxjs";

import { ServiceDocumentApiService } from "../api/service-document-api.service";
import { ServiceDocument } from "../models/service-document.model";

import { ServiceDocumentService } from "./service-document.service";

describe("ServiceDocumentService", () => {
  let service: ServiceDocumentService;

  const serviceDocument: ServiceDocument = {
    id: "document-id",
    storagePath: "documents/services-es.pdf",
    originalName: "services-es.pdf",
    mimeType: "application/pdf",
    size: 1000,
    createdAt: "2026-08-06T10:00:00.000Z",
    updatedAt: "2026-08-06T10:00:00.000Z",
    language: "es",
  };

  const updatedServiceDocument: ServiceDocument = {
    ...serviceDocument,
    storagePath: "documents/new-services-es.pdf",
    originalName: "new-services-es.pdf",
    size: 2000,
    updatedAt: "2026-09-03T18:22:00.000Z",
  };

  const serviceDocumentApiServiceMock = {
    getCurrentDocument: vi.fn(),
    createDownloadSignedUrl: vi.fn(),
    uploadDocument: vi.fn(),
    deleteDocument: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValue(of(serviceDocument));

    serviceDocumentApiServiceMock.createDownloadSignedUrl
      .mockReturnValue(
        of(
          "https://example.com/signed-services-document",
        ),
      );

    serviceDocumentApiServiceMock.uploadDocument
      .mockReturnValue(of(updatedServiceDocument));

    serviceDocumentApiServiceMock.deleteDocument
      .mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        ServiceDocumentService,
        {
          provide: ServiceDocumentApiService,
          useValue: serviceDocumentApiServiceMock,
        },
      ],
    });

    service = TestBed.inject(ServiceDocumentService);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should load the current document for the selected language", () => {
    service.loadCurrentDocument("es").subscribe();

    expect(
      serviceDocumentApiServiceMock.getCurrentDocument,
    ).toHaveBeenCalledWith("es");

    expect(service.getDocument("es")).toEqual(
      serviceDocument,
    );

    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it("should set the selected language document to null when none exists", () => {
    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(of(null));

    service.loadCurrentDocument("es").subscribe();

    expect(service.getDocument("es")).toBeNull();
    expect(service.isLoading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it("should handle an error while loading a document", () => {
    const error = new Error(
      "Unable to load service document",
    );

    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(
        throwError(() => error),
      );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    service.loadCurrentDocument("es").subscribe();

    expect(service.getDocument("es")).toBeNull();
    expect(service.hasError()).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it("should keep documents separated by language", () => {
    const englishDocument: ServiceDocument = {
      ...serviceDocument,
      id: "english-document-id",
      storagePath: "documents/services-en.pdf",
      originalName: "services-en.pdf",
      language: "en",
    };

    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(of(serviceDocument));

    service.loadCurrentDocument("es").subscribe();

    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(of(englishDocument));

    service.loadCurrentDocument("en").subscribe();

    expect(service.getDocument("es")).toEqual(
      serviceDocument,
    );

    expect(service.getDocument("en")).toEqual(
      englishDocument,
    );
  });

  it("should upload a service document for the selected language", async () => {
    const file = new File(
      ["document content"],
      "new-services-es.pdf",
      {
        type: "application/pdf",
      },
    );

    await firstValueFrom(
      service.uploadDocument(file, "es"),
    );

    expect(
      serviceDocumentApiServiceMock.uploadDocument,
    ).toHaveBeenCalledWith(file, "es");

    expect(service.getDocument("es")).toEqual(
      updatedServiceDocument,
    );

    expect(service.isUploading()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it("should propagate an upload error", async () => {
    const error = new Error(
      "Unable to upload service document",
    );

    const file = new File(
      ["document content"],
      "services-es.pdf",
      {
        type: "application/pdf",
      },
    );

    serviceDocumentApiServiceMock.uploadDocument
      .mockReturnValueOnce(
        throwError(() => error),
      );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    await expect(
      firstValueFrom(
        service.uploadDocument(file, "es"),
      ),
    ).rejects.toThrow(
      "Unable to upload service document",
    );

    expect(service.hasError()).toBe(true);
    expect(service.isUploading()).toBe(false);
  });

  it("should delete the current document for the selected language", async () => {
    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(of(serviceDocument));

    service.loadCurrentDocument("es").subscribe();

    await firstValueFrom(
      service.deleteCurrentDocument("es"),
    );

    expect(
      serviceDocumentApiServiceMock.deleteDocument,
    ).toHaveBeenCalledWith(serviceDocument.id);

    expect(service.getDocument("es")).toBeNull();
    expect(service.isDeleting()).toBe(false);
    expect(service.hasError()).toBe(false);
  });

  it("should do nothing when deleting without a document for the selected language", async () => {
    await firstValueFrom(
      service.deleteCurrentDocument("es"),
    );

    expect(
      serviceDocumentApiServiceMock.deleteDocument,
    ).not.toHaveBeenCalled();

    expect(service.isDeleting()).toBe(false);
  });

  it("should propagate a delete error", async () => {
    const error = new Error(
      "Unable to delete service document",
    );

    serviceDocumentApiServiceMock.getCurrentDocument
      .mockReturnValueOnce(of(serviceDocument));

    service.loadCurrentDocument("es").subscribe();

    serviceDocumentApiServiceMock.deleteDocument
      .mockReturnValueOnce(
        throwError(() => error),
      );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    await expect(
      firstValueFrom(
        service.deleteCurrentDocument("es"),
      ),
    ).rejects.toThrow(
      "Unable to delete service document",
    );

    expect(service.hasError()).toBe(true);
    expect(service.isDeleting()).toBe(false);

    expect(service.getDocument("es")).toEqual(
      serviceDocument,
    );
  });

  it("should create a signed document URL", async () => {
    const signedUrl = await firstValueFrom(
      service.createDownloadSignedUrl(
        "documents/services-es.pdf",
      ),
    );

    expect(
      serviceDocumentApiServiceMock
        .createDownloadSignedUrl,
    ).toHaveBeenCalledWith(
      "documents/services-es.pdf",
    );

    expect(signedUrl).toBe(
      "https://example.com/signed-services-document",
    );

    expect(service.hasError()).toBe(false);
  });

  it("should propagate a signed URL error", async () => {
    const error = new Error(
      "Unable to create signed URL",
    );

    serviceDocumentApiServiceMock.createDownloadSignedUrl
      .mockReturnValueOnce(
        throwError(() => error),
      );

    vi.spyOn(console, "error").mockImplementation(
      () => undefined,
    );

    await expect(
      firstValueFrom(
        service.createDownloadSignedUrl(
          "documents/services-es.pdf",
        ),
      ),
    ).rejects.toThrow(
      "Unable to create signed URL",
    );

    expect(service.hasError()).toBe(true);
  });
});
