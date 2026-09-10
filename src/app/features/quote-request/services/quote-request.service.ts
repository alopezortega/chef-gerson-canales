import { inject, Injectable } from "@angular/core";

import { QuoteRequest } from "../models/quote-request.model";
import { Observable } from "rxjs";
import { QuoteRequestApiService } from "../api/quote-request-api.service";

@Injectable({
  providedIn: "root",
})
export class QuoteRequestService {
  private readonly quoteRequestApiService = inject(QuoteRequestApiService);

  createQuoteRequest(
    request: QuoteRequest,
    attachment: File | null,
  ): Observable<void> {
    return this.quoteRequestApiService.createQuoteRequest(request, attachment);
  }
}
