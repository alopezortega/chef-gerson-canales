import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { QuoteRequest } from "../models/quote-request.model";

@Injectable({
  providedIn: "root",
})
export class QuoteRequestApiService {
  private readonly http = inject(HttpClient);

  private readonly supabaseUrl = environment.supabase.url;

  private readonly apiUrl = `${this.supabaseUrl}/functions/v1`;

  createQuoteRequest(
    quoteRequest: QuoteRequest,
    attachment: File | null,
  ): Observable<void> {
    const formData = new FormData();

    formData.append("request", JSON.stringify(quoteRequest));

    if (attachment) {
      formData.append("attachment", attachment);
    }

    return this.http.post<void>(
      `${this.apiUrl}/submit-quote-request`,
      formData,
    );
  }
}
