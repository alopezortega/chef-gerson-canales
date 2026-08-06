import { inject, Injectable, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/config/supabase-client.token';
import type {
  AdminQuoteRequest,
  AdminQuoteRequestRow,
  QuoteRequestStatus,
} from '../models/admin-quote-request.model';

const QUOTE_ATTACHMENTS_BUCKET = 'quote-request-attachments';

@Injectable({
  providedIn: 'root',
})
export class AdminQuoteRequestService {
  private readonly supabaseClient = inject(SUPABASE_CLIENT);
  private readonly loadingState = signal<boolean>(false);
  readonly isLoading = this.loadingState.asReadonly();
  private readonly errorState = signal<boolean>(false);
  readonly hasError = this.errorState.asReadonly();

  private readonly requestsState = signal<AdminQuoteRequest[]>([]);
  readonly requests = this.requestsState.asReadonly();
  private readonly selectedRequestState = signal<AdminQuoteRequest | null>(null);
  readonly selectedRequest = this.selectedRequestState.asReadonly();

  private readonly updatingStatusState = signal<boolean>(false);
  readonly isUpdatingStatus = this.updatingStatusState.asReadonly();

  async loadQuoteRequests(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(false);

    try {
      const { data, error } = await this.supabaseClient
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedRequests = (data ?? []).map((row) => this.mapRowToQuoteRequest(row));

      this.requestsState.set(mappedRequests);
    } catch (error) {
      console.error('Unable to load quote requests:', error);
      this.errorState.set(true);
      this.requestsState.set([]);
    } finally {
      this.loadingState.set(false);
    }
  }

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
  async loadQuoteRequestById(id: string): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(false);
    this.selectedRequestState.set(null);

    try {
      const { data, error } = await this.supabaseClient
        .from('quote_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      const mappedRequest = this.mapRowToQuoteRequest(data);

      this.selectedRequestState.set(mappedRequest);
    } catch (error) {
      console.error('Unable to load quote request:', error);
      this.errorState.set(true);
      this.selectedRequestState.set(null);
    } finally {
      this.loadingState.set(false);
    }
  }

  async updateQuoteRequestStatus(id: string, status: QuoteRequestStatus): Promise<void> {
    this.updatingStatusState.set(true);
    this.errorState.set(false);

    try {
      const { error } = await this.supabaseClient
        .from('quote_requests')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }
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
        requests.map((request) => (request.id === id ? { ...request, status } : request)),
      );
    } catch (error) {
      console.error('Unable to update status:', error);
      this.errorState.set(true);
    } finally {
      this.updatingStatusState.set(false);
    }
  }

  async createAttachmentSignedUrl(attachmentPath: string): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(QUOTE_ATTACHMENTS_BUCKET)
      .createSignedUrl(attachmentPath, 60);

    if (error) {
      throw error;
    }

    if (!data.signedUrl) {
      throw new Error('Unable to create attachment signed URL');
    }

    return data.signedUrl;
  }
}
