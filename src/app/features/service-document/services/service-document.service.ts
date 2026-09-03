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

import { ServiceDocumentApiService } from "../api/service-document-api.service";
import { ServiceDocument } from "../models/service-document.model";

@Injectable({
  providedIn: "root",
})
export class ServiceDocumentService {
  private readonly serviceDocumentApiService = inject(
    ServiceDocumentApiService,
  );

  private readonly currentDocumentState = signal<ServiceDocument | null>(null);

  readonly currentDocument = this.currentDocumentState.asReadonly();

  private readonly loadingState = signal(false);

  readonly isLoading = this.loadingState.asReadonly();

  private readonly errorState = signal(false);

  readonly hasError = this.errorState.asReadonly();

  private readonly uploadingState = signal(false);

  readonly isUploading = this.uploadingState.asReadonly();

  private readonly deletingState = signal(false);

  readonly isDeleting = this.deletingState.asReadonly();

  loadCurrentDocument(): Observable<void> {
    this.loadingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .getCurrentDocument()
      .pipe(
        tap((document) => {
          this.currentDocumentState.set(document);
        }),
        map(() => undefined),
        catchError((error) => {
          console.error(
            "Unable to load service document:",
            error,
          );

          this.currentDocumentState.set(null);
          this.errorState.set(true);

          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      );
  }

  uploadDocument(file: File): Observable<void> {
    this.uploadingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .uploadDocument(file)
      .pipe(
        tap((document) => {
          this.currentDocumentState.set(document);
        }),
        map(() => undefined),
        catchError((error) => {
          console.error(
            "Unable to upload service document:",
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

  deleteCurrentDocument(): Observable<void> {
    const currentDocument = this.currentDocumentState();

    if (!currentDocument) {
      return of(undefined);
    }

    this.deletingState.set(true);
    this.errorState.set(false);

    return this.serviceDocumentApiService
      .deleteDocument(currentDocument.id)
      .pipe(
        tap(() => {
          this.currentDocumentState.set(null);
        }),
        catchError((error) => {
          console.error(
            "Unable to delete service document:",
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
}
