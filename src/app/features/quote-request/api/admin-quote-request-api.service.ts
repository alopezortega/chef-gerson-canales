import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  AdminQuoteRequest,
  QuoteRequestStatus,
} from "../models/admin-quote-request.model";

@Injectable({
  providedIn: "root",
})
export class AdminQuoteRequestApiService {
  private readonly http = inject(HttpClient);

  private readonly supabaseUrl = environment.supabase.url;

  private readonly apiUrl = `${this.supabaseUrl}/functions/v1`;

  deleteQuoteRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-quote-request/${id}`);
  }

  getQuoteRequests(): Observable<AdminQuoteRequest[]> {
    return this.http.get<AdminQuoteRequest[]>(`${this.apiUrl}/quote-requests`);
  }

  getQuoteRequestById(id: string): Observable<AdminQuoteRequest> {
    return this.http.get<AdminQuoteRequest>(
      `${this.apiUrl}/quote-requests/${id}`,
    );
  }

  updateQuoteRequestStatus(
    id: string,
    status: QuoteRequestStatus,
  ): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/quote-requests/${id}`, {
      status,
    });
  }

  getAttachmentSignedUrl(attachmentPath: string): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl}/quote-request-attachments/${attachmentPath}`,
    );
  }
}
