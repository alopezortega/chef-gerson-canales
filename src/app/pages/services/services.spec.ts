import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideTranslateService } from "@ngx-translate/core";
import { of, throwError } from "rxjs";

import { ServiceDocument } from "../../features/service-document/models/service-document.model";
import { ServiceDocumentService } from "../../features/service-document/services/service-document.service";

import { ServicesComponent } from "./services";

describe("ServicesComponent", () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  const currentDocument = signal<ServiceDocument | null>(null);

  const isLoading = signal(false);

  const serviceDocumentServiceMock = {
    currentDocument,
    isLoading,

    loadCurrentDocument: vi.fn(),

    createDownloadSignedUrl: vi.fn(),
  };

  const document: ServiceDocument = {
    id: "document-id",
    storagePath: "documents/services.pdf",
    originalName: "services.pdf",
    mimeType: "application/pdf",
    size: 1000,
    createdAt: "2026-08-06T10:00:00.000Z",
    updatedAt: "2026-08-06T10:00:00.000Z",
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    currentDocument.set(null);
    isLoading.set(false);

    serviceDocumentServiceMock.loadCurrentDocument
      .mockReturnValue(of(undefined));

    serviceDocumentServiceMock.createDownloadSignedUrl
      .mockReturnValue(
        of(
          "https://example.com/signed-document",
        ),
      );

    await TestBed.configureTestingModule({
      imports: [ServicesComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        {
          provide: ServiceDocumentService,
          useValue: serviceDocumentServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ServicesComponent,
    );

    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load the current document on initialization", () => {
    expect(
      serviceDocumentServiceMock.loadCurrentDocument,
    ).toHaveBeenCalledTimes(1);
  });

  it("should not download when there is no current document", () => {
    component["downloadServiceDocument"]();

    expect(
      serviceDocumentServiceMock.createDownloadSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it("should not start another download while one is already in progress", () => {
    currentDocument.set(document);

    component["isDownloading"].set(true);

    component["downloadServiceDocument"]();

    expect(
      serviceDocumentServiceMock.createDownloadSignedUrl,
    ).not.toHaveBeenCalled();
  });

  it("should create and open a signed document URL", () => {
    currentDocument.set(document);

    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    component["downloadServiceDocument"]();

    expect(
      serviceDocumentServiceMock.createDownloadSignedUrl,
    ).toHaveBeenCalledWith(
      "documents/services.pdf",
    );

    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://example.com/signed-document",
      "_blank",
      "noopener,noreferrer",
    );

    expect(component["downloadError"]()).toBe(false);
    expect(component["isDownloading"]()).toBe(false);
  });

  it("should handle an error while preparing the download", () => {
    currentDocument.set(document);

    serviceDocumentServiceMock.createDownloadSignedUrl
      .mockReturnValueOnce(
        throwError(
          () =>
            new Error(
              "Unable to create signed URL",
            ),
        ),
      );

    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    component["downloadServiceDocument"]();

    expect(windowOpenSpy).not.toHaveBeenCalled();

    expect(component["downloadError"]()).toBe(true);
    expect(component["isDownloading"]()).toBe(false);
  });
});
