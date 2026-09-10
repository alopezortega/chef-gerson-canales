import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { ServiceDocument } from "../models/service-document.model";

import { ServiceDocumentApiService } from "./service-document-api.service";

describe("ServiceDocumentApiService", () => {
  let service: ServiceDocumentApiService;
  let httpTestingController: HttpTestingController;

  const apiUrl = `${environment.supabase.url}/functions/v1`;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServiceDocumentApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ServiceDocumentApiService);
    httpTestingController = TestBed.inject(
      HttpTestingController,
    );
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  });

  it("should get the current document for the selected language", () => {
    let result: ServiceDocument | null | undefined;

    service
      .getCurrentDocument("es")
      .subscribe((document) => {
        result = document;
      });

    const request = httpTestingController.expectOne(
      (req) =>
        req.url === `${apiUrl}/service-document` &&
        req.params.get("language") === "es",
    );

    expect(request.request.method).toBe("GET");

    request.flush(serviceDocument);

    expect(result).toEqual(serviceDocument);
  });

  it("should return null when there is no current document for the selected language", () => {
    let result: ServiceDocument | null | undefined;

    service
      .getCurrentDocument("en")
      .subscribe((document) => {
        result = document;
      });

    const request = httpTestingController.expectOne(
      (req) =>
        req.url === `${apiUrl}/service-document` &&
        req.params.get("language") === "en",
    );

    expect(request.request.method).toBe("GET");

    request.flush(null);

    expect(result).toBeNull();
  });

  it("should request a signed download URL", () => {
    let result: string | undefined;

    service
      .createDownloadSignedUrl(
        "documents/services.pdf",
      )
      .subscribe((signedUrl) => {
        result = signedUrl;
      });

    const request = httpTestingController.expectOne(
      (req) =>
        req.url ===
          `${apiUrl}/service-document/download` &&
        req.params.get("path") ===
          "documents/services.pdf",
    );

    expect(request.request.method).toBe("GET");

    request.flush(
      "https://example.com/signed-services-document",
    );

    expect(result).toBe(
      "https://example.com/signed-services-document",
    );
  });

  it("should upload a service document for the selected language", () => {
    const file = new File(
      ["document content"],
      "services-es.pdf",
      {
        type: "application/pdf",
      },
    );

    let result: ServiceDocument | undefined;

    service
      .uploadDocument(file, "es")
      .subscribe((document) => {
        result = document;
      });

    const request = httpTestingController.expectOne(
      `${apiUrl}/service-document`,
    );

    expect(request.request.method).toBe("POST");
    expect(request.request.body).toBeInstanceOf(FormData);

    const formData = request.request.body as FormData;

    expect(formData.get("file")).toBe(file);
    expect(formData.get("language")).toBe("es");

    request.flush(serviceDocument);

    expect(result).toEqual(serviceDocument);
  });

  it("should delete a service document", () => {
    service.deleteDocument("document-id").subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/service-document/document-id`,
    );

    expect(request.request.method).toBe("DELETE");

    request.flush(null, {
      status: 204,
      statusText: "No Content",
    });
  });
});
