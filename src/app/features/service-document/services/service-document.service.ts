import { inject, Injectable, signal } from "@angular/core";
import {
  catchError,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  tap,
  throwError,
} from "rxjs";

import { SupportedLanguage } from "../../../core/models/supported-language.type";
import { ServiceDocumentApiService } from "../api/service-document-api.service";
import { ServiceDocument } from "../models/service-document.model";

type ServiceDocumentsByLanguage = Record<
  SupportedLanguage,
  ServiceDocument | null
>;

@Injectable({
  providedIn: "root",
})
export class ServiceDocumentService {
  private readonly serviceDocumentApiService = inject(
    ServiceDocumentApiService,
  );

  private readonly documentsState = signal<ServiceDocumentsByLanguage>({
    es: null,
    en: null,
  });

  readonly documents = this.documentsState.asReadonly();

  private readonly loadingState = signal(false);
  readonly isLoading = this.loadingState.asReadonly();

  private readonly errorState = signal(false);
  readonly hasError = this.errorState.asReadonly();

  private readonly uploadingState = signal(false);
  readonly isUploading = this.uploadingState.asReadonly();

  private readonly deletingState = signal(false);
  readonly isDeleting = this.deletingState.asReadonly();

  getDocument(
    language: SupportedLanguage,
  ): ServiceDocument | null {
    return this.documentsState()[language];
  }

  loadCurrentDocument(
    language: SupportedLanguage,
  ): Observable<void> {
    this.loadingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .getCurrentDocument(language)
      .pipe(
        tap((document) => {
          this.setDocument(language, document);
        }),
        map(() => undefined),
        catchError((error) => {
          console.error(
            `Unable to load ${language} service document:`,
            error,
          );

          this.setDocument(language, null);
          this.errorState.set(true);

          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      );
  }

  uploadDocument(
    file: File,
    language: SupportedLanguage,
  ): Observable<void> {
    this.uploadingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .uploadDocument(file, language)
      .pipe(
        tap((document) => {
          this.setDocument(language, document);
        }),
        map(() => undefined),
        catchError((error) => {
          console.error(
            `Unable to upload ${language} service document:`,
            error,
          );

          this.errorState.set(true);

          return throwError(() => error);
        }),
        finalize(() => {
          this.uploadingState.set(false);
        }),
      );
  }

  deleteCurrentDocument(
    language: SupportedLanguage,
  ): Observable<void> {
    const currentDocument = this.documentsState()[language];

    if (!currentDocument) {
      return of(undefined);
    }

    this.deletingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .deleteDocument(currentDocument.id)
      .pipe(
        tap(() => {
          this.setDocument(language, null);
        }),
        catchError((error) => {
          console.error(
            `Unable to delete ${language} service document:`,
            error,
          );

          this.errorState.set(true);

          return throwError(() => error);
        }),
        finalize(() => {
          this.deletingState.set(false);
        }),
      );
  }

  createDownloadSignedUrl(
    storagePath: string,
  ): Observable<string> {
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .createDownloadSignedUrl(storagePath)
      .pipe(
        catchError((error) => {
          console.error(
            "Unable to create service document signed URL:",
            error,
          );

          this.errorState.set(true);

          return throwError(() => error);
        }),
      );
  }

  private setDocument(
    language: SupportedLanguage,
    document: ServiceDocument | null,
  ): void {
    this.documentsState.update((documents) => ({
      ...documents,
      [language]: document,
    }));
  }
}
