import { inject, Injectable, signal } from "@angular/core";
import { SUPABASE_CLIENT } from "../../../core/config/supabase-client.token";
import type {
  AdminQuoteRequest,
  AdminQuoteRequestRow,
  QuoteRequestStatus,
} from "../models/admin-quote-request.model";
import { catchError, EMPTY, finalize, Observable, tap } from "rxjs";
import { AdminQuoteRequestApiService } from "../api/admin-quote-request-api.service";

@Injectable({
  providedIn: "root",
})
export class AdminQuoteRequestService {
  private readonly supabaseClient = inject(SUPABASE_CLIENT);
  private readonly loadingState = signal<boolean>(false);
  readonly isLoading = this.loadingState.asReadonly();
  private readonly errorState = signal<boolean>(false);
  readonly hasError = this.errorState.asReadonly();

  private readonly requestsState = signal<AdminQuoteRequest[]>([]);
  readonly requests = this.requestsState.asReadonly();
  private readonly selectedRequestState = signal<AdminQuoteRequest | null>(
    null,
  );
  readonly selectedRequest = this.selectedRequestState.asReadonly();

  private readonly updatingStatusState = signal<boolean>(false);
  readonly isUpdatingStatus = this.updatingStatusState.asReadonly();

  private readonly deletingStatus = signal<boolean>(false);
  readonly isDeleting = this.deletingStatus.asReadonly();

  private readonly adminQuoteRequestApiService = inject(
    AdminQuoteRequestApiService,
  );

  loadQuoteRequests(): Observable<AdminQuoteRequest[]> {
    this.loadingState.set(true);
    this.errorState.set(false);
    return this.adminQuoteRequestApiService.getQuoteRequests()
      .pipe(
        tap((requests) => {
          this.requestsState.set(requests);
        }),
        catchError((error) => {
          console.error("Unable to recover requests", error);
          this.errorState.set(true);
          this.requestsState.set([]);
          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      );
  }

  // Mapping from database (snake_case) to Angular model (camelCase).
  // Supabase stores fields in snake_case while Angular/TypeScript
  // conventions use camelCase for object properties.
  private mapRowToQuoteRequest(row: AdminQuoteRequestRow): AdminQuoteRequest {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      eventType: row.event_type,
      eventDate: row.event_date,
      guestCount: row.guest_count,
      location: row.location,
      dietaryRequirements: row.dietary_requirements,
      additionalInformation: row.additional_information,
      privacyAccepted: row.privacy_accepted,
      attachmentPath: row.attachment_path,
      attachmentName: row.attachment_name,
      attachmentType: row.attachment_type,
      attachmentSize: row.attachment_size,
      status: row.status,
      createdAt: row.created_at,
    };
  }
  loadQuoteRequestById(id: string): Observable<AdminQuoteRequest> {
    this.loadingState.set(true);
    this.errorState.set(false);
    this.selectedRequestState.set(null);

    return this.adminQuoteRequestApiService.getQuoteRequestById(id)
      .pipe(
        tap((request) => {
          this.selectedRequestState.set(request);
        }),
        catchError((error) => {
          console.error("Unable to recover request", error);
          this.errorState.set(true);
          this.selectedRequestState.set(null);

          return EMPTY;
        }),
        finalize(() => {
          this.loadingState.set(false);
        }),
      );
  }

  updateQuoteRequestStatus(
    id: string,
    status: QuoteRequestStatus,
  ): Observable<void> {
    this.updatingStatusState.set(true);
    this.errorState.set(false);
    return this.adminQuoteRequestApiService.updateQuoteRequestStatus(id, status)
      .pipe(
        tap(() => {
          this.selectedRequestState.update((currentRequest) => {
            if (!currentRequest || currentRequest.id !== id) {
              return currentRequest;
            }

            return {
              ...currentRequest,
              status,
            };
          });
          this.requestsState.update((requests) =>
            requests.map((
              request,
            ) => (request.id === id ? { ...request, status } : request))
          );
        }),
        catchError((error) => {
          console.error("Unable to update status", error);
          this.errorState.set(true);
          return EMPTY;
        }),
        finalize(() => {
          this.updatingStatusState.set(false);
        }),
      );
  }
  createAttachmentSignedUrl(attachmentPath: string): Observable<string> {
    return this.adminQuoteRequestApiService.getAttachmentSignedUrl(
      attachmentPath,
    );
  }

  deleteQuoteRequest(id: string): Observable<void> {
    if (this.isDeleting()) {
      return EMPTY;
    }

    this.deletingStatus.set(true);

    return this.adminQuoteRequestApiService.deleteQuoteRequest(id).pipe(
      tap(() => {
        this.requestsState.update((requests) =>
          requests.filter((request) => request.id !== id)
        );

        if (this.selectedRequestState()?.id === id) {
          this.selectedRequestState.set(null);
        }
      }),
      finalize(() => {
        this.deletingStatus.set(false);
      }),
    );
  }
}
