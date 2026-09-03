import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideTranslateService } from "@ngx-translate/core";
import { of, throwError } from "rxjs";

import { ServiceDocument } from "../../features/service-document/models/service-document.model";
import { ServiceDocumentService } from "../../features/service-document/services/service-document.service";

import { AdminServiceDocument } from "./admin-service-document";

describe("AdminServiceDocument", () => {
  let component: AdminServiceDocument;
  let fixture: ComponentFixture<AdminServiceDocument>;

  const currentDocument = signal<ServiceDocument | null>(null);

  const isLoading = signal(false);
  const isUploading = signal(false);
  const isDeleting = signal(false);
  const hasError = signal(false);

  const serviceDocumentServiceMock = {
    currentDocument,
    isLoading,
    isUploading,
    isDeleting,
    hasError,

    loadCurrentDocument: vi.fn(),
    uploadDocument: vi.fn(),
    deleteCurrentDocument: vi.fn(),
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
    isUploading.set(false);
    isDeleting.set(false);
    hasError.set(false);

    serviceDocumentServiceMock.loadCurrentDocument
      .mockReturnValue(of(undefined));

    serviceDocumentServiceMock.uploadDocument
      .mockReturnValue(of(undefined));

    serviceDocumentServiceMock.deleteCurrentDocument
      .mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AdminServiceDocument],
      providers: [
        provideTranslateService(),
        {
          provide: ServiceDocumentService,
          useValue: serviceDocumentServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      AdminServiceDocument,
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

  it("should accept a valid PDF file", () => {
    const file = new File(
      ["document content"],
      "services.pdf",
      {
        type: "application/pdf",
      },
    );

    const event = {
      target: {
        files: [file],
      },
    } as unknown as Event;

    component["onFileSelected"](event);

    expect(component["selectedFile"]()).toBe(file);
    expect(component["invalidFile"]()).toBe(false);
  });

  it("should reject a file that is not a PDF", () => {
    const file = new File(
      ["image content"],
      "image.png",
      {
        type: "image/png",
      },
    );

    const event = {
      target: {
        files: [file],
        value: "image.png",
      },
    } as unknown as Event;

    component["onFileSelected"](event);

    expect(component["selectedFile"]()).toBeNull();
    expect(component["invalidFile"]()).toBe(true);
  });

  it("should upload the selected PDF", () => {
    const file = new File(
      ["document content"],
      "services.pdf",
      {
        type: "application/pdf",
      },
    );

    component["selectedFile"].set(file);

    component["uploadDocument"]();

    expect(
      serviceDocumentServiceMock.uploadDocument,
    ).toHaveBeenCalledWith(file);

    expect(component["selectedFile"]()).toBeNull();
    expect(component["uploadSuccess"]()).toBe(true);
  });

  it("should handle an upload error", () => {
    const file = new File(
      ["document content"],
      "services.pdf",
      {
        type: "application/pdf",
      },
    );

    component["selectedFile"].set(file);

    serviceDocumentServiceMock.uploadDocument
      .mockReturnValueOnce(
        throwError(
          () =>
            new Error(
              "Unable to upload service document",
            ),
        ),
      );

    component["uploadDocument"]();

    expect(component["uploadSuccess"]()).toBe(false);

    expect(component["selectedFile"]()).toBe(file);
  });

  it("should delete the current document", () => {
    currentDocument.set(document);

    component["deleteDocument"]();

    expect(
      serviceDocumentServiceMock.deleteCurrentDocument,
    ).toHaveBeenCalledTimes(1);

    expect(component["selectedFile"]()).toBeNull();
    expect(component["deleteSuccess"]()).toBe(true);
  });

  it("should handle a delete error", () => {
    currentDocument.set(document);

    serviceDocumentServiceMock.deleteCurrentDocument
      .mockReturnValueOnce(
        throwError(
          () =>
            new Error(
              "Unable to delete service document",
            ),
        ),
      );

    component["deleteDocument"]();

    expect(component["deleteSuccess"]()).toBe(false);
  });
});
